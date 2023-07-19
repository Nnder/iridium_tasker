<?php
include 'db.php';
include 'php.php';
include 'token.php';
session_start();

//...........Добавление сотрудника...............
if (isset($_GET['button-form']) && $_GET['button-form'] == 'button-add' && !empty($_SESSION['auth'])){
  $add_number_phone = '7'.pg_escape_string($_GET['add_number_phone']);
  $add_full_name = pg_escape_string($_GET['add_full_name']);
  $add_post = pg_escape_string($_GET['add_post']);
  $work_time = pg_escape_string($_GET['work_time']);
  $sql = "SELECT phone FROM users WHERE phone='$add_number_phone'";
  $res = pg_query($connection, $sql);
  $row = pg_fetch_array($res);
  if ($row['phone'] != ''){
    echo "$('.number-error').text('Номер уже зарегистрирован');";
  }
  elseif (mb_strlen($add_number_phone)!=11 || !(is_numeric($add_number_phone)))
  {
    echo "$('.number-error').text('Неверный формат номера');";
  }
  else{
    $sql ="INSERT INTO users (phone, fio, profession, team, role, work_time, status) VALUES ('".$add_number_phone."', '".$add_full_name."', '".$add_post."', '".$_GET['add_team']."', '".$_GET['add_access_level']."', '".$work_time."', true)";
    pg_query($connection, $sql);
    echo "table_update(); $('#modal_add').modal('hide');";
  }
}

//.............Редактирование сотрудника.............
if (isset($_GET['button-form']) && $_GET['button-form'] == 'button-save' && !empty($_SESSION['auth'])){
  echo "aaa";
  $full_name = pg_escape_string($_GET['full_name']);
  $post = pg_escape_string($_GET['post']);
  $number_phone = mb_substr($_GET['number_phone'],1,11);
  $team = $_GET['team'];
  $work_time = pg_escape_string($_GET['work_time']);
  $chatid = pg_escape_string($_GET['chat_id']);
  if (isset($_GET['active']) && $_GET['active'] == "true") {
    $active = true;
  }
  else{
    $active = false;
  }
  $sql ="UPDATE users SET fio='".$full_name."', profession='".$post."', team='".$team."', role='".$_GET['access_level']."', status='".$active."', chat_id='".$chatid."', work_time='".$work_time."' WHERE phone = '".$number_phone."'";
  pg_query($connection, $sql);
  echo "table_update(); $('#modal_add').modal('hide');";
}


//..............Авторизация....................
//Ввод номера
if (isset($_GET['InputTel']))
{
  $tel='7'.(pg_escape_string($_GET['InputTel']));
  $employee=getdata($connection, $tel);
  if ($employee[0] != '' && $tel == $employee[0]) {
          $code = rand(100000,999999);
          $_SESSION['code'] = $code;
          file_get_contents("https://api.telegram.org/bot".$token."/sendMessage?chat_id=".$employee[1]."&text=".$code); 
          echo "<div class='mb-3'>
          <input type='hidden' name='InputCode_tel' value='".$tel."'>
          <label for='InputCode' class='form-label'>Введите код</label>
          <input type='code' class='form-control mx-auto auth_enter' style='width:250px;' id='InputCode' name='InputCode'>
          <label style='color:lightgrey; font-size:80%'>Код был отправлен на номер +".$tel."</label><br/>
          <button class='button-back' type='button' style='' onclick='auth_back()'><a>Ошиблись номером?</br>(вернуться)</a></button>
          </div><button type='button' class='btn btn-primary auth_button' name='button-auth' onclick='auth_num()'>Подтвердить</button>
          <p class='text-center' id='auth-error' style='color:red; margin-top:10px'></p>";
  }
  else {
    echo('Номер не зарегистрирован в системе!');
  }
}

//Проверка кода
if (isset($_GET['InputCode']))
{
  $code1 = $_GET['InputCode'];
  $tel = $_GET['InputCode_tel'];

  $employee=getdata($connection, $tel);
  if ($_SESSION['code'] == $code1) {
    session_start();
    $_SESSION['auth'] = $employee[0];
    echo("<meta http-equiv='refresh' content='1'>");
  }
  else{
    echo("Неверный код!");
  }
}
//Возврат к вводу номера
if (isset($_GET['Back']))
{
  echo "<div class='mb-3'> 
  <label for='InputTel' class='form-label'>Введите номер телефона</label>
  <div class='row'>
  <div class ='mx-auto'>
  <input readonly type='tel' class='form-control' style='width:20px; padding:6px 1px 6px 0px; margin-right:-5px; display:inline; border:none; border-radius:5px 0 0 5px;' onclick='this.nextElementSibling.focus();' value='+7'>
  <input autocomplete='off' onkeypress='return event.charCode >= 48 && event.charCode <= 57' type='tel' maxlength='10' class='form-control auth_enter' style='width:200px; padding-left:2px; display:inline; border:none; border-radius:0 5px 5px 0; outline:none; box-shadow: none;' id='InputTel' name='InputTel'>
  </div>
  </div>
  </div>
  <button type='button' class='btn btn-primary auth_button' name='button-auth' onclick='auth_num()'>Отправить</button>
  <p class='text-center' id='auth-error' style='color:red; margin-top:10px'></p>";
}

//.................Подгрузка ежедневных отчетов..................
if (isset($_POST['first']) && isset($_POST['last'])){
  $tele = $_POST['tel'];
  $sql = "SELECT plan, fact, hours, date FROM tasks, users WHERE phone='".$_POST['tel']."' AND date BETWEEN '".$_POST['first']."' AND '".$_POST['last']."' AND tasks.chat_id=users.chat_id";
  $rs = pg_query($connection, $sql) or die("wait what\n");
  while ($row = pg_fetch_array($rs)) {
    if ($row[0] != '') {      
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('sick', '');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('vacation', '');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('takeaday', '');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('work', 'selected');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('nowork', '');";
        $worked = 'background-color: red';
          if ($row[1] != ''){
            $worked = 'background-color: lime';
            echo "$(\".air-datepicker-cell[day='".$row[3]."']\").append(\"<div class='circle plan'></div>\");";
          }
        }
      elseif ($row[1] != ''){
        $worked = 'background-color: lime';
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('sick', '');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('vacation', '');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('takeaday', '');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('work', 'selected');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('nowork', '');";
        }
        else{
          $worked = 'background-color: red';
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('sick', '');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('vacation', '');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('takeaday', '');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('work', '');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('nowork', 'selected');";
        }
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").append(\"<div class='circle' style='".$worked."'></div>\");";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('tel', '".$tele."');";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('plan', `".$row[0]."`);";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('fact', `".$row[1]."`);";
        echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('hours', '".$row[2]."');";
    }


    $sql5 = "SELECT cause, freedays.from FROM freedays, users WHERE phone='".$_POST['tel']."' and freedays.from = '".$_POST['first']."' AND freedays.chat_id=users.chat_id";
    $rs5 = pg_query($connection, $sql5) or die("wait what\n");
    while ($row5 = pg_fetch_array($rs5)) {
	if ($row[0] == 'К врачу'){
      $worked = 'background-color: black';
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('sick', 'selected');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('vacation', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('takeaday', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('work', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('nowork', '');";
	}
	elseif ($row[0] == 'V'){
      $worked = 'background-color: #cece00';
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('sick', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('vacation', 'selected');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('takeaday', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('work', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('nowork', '');";
	}
	elseif ($row[0] == 'Взять день'){
      $worked = 'background-color: darkgray';
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('sick', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('vacation', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('takeaday', 'selected');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('work', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('nowork', '');";
	}
	elseif ($row[0] == 'N') {
      $worked = 'background-color: red';
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('sick', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('vacation', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('takeaday', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('work', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[1]."']\").attr('nowork', 'selected');";
	}

}
}

//.......Команды..............
if (isset($_POST['teams']) && !empty($_SESSION['auth']) && access($connection) == 2) {
  $sql = "SELECT DISTINCT team FROM users";
  $res = pg_query($connection, $sql) or die("wait what\n");
  while ($combobox = pg_fetch_array($res)) {
    echo  "
    <div class='row' style='width:100%; margin:0; padding-bottom:3px; padding-top:3px;' title=\"".htmlspecialchars(trim($combobox[0]))."\">
      <div class='col' style='width:45%; flex:auto;padding:0;'>
        <input type='text' class='form-control' value=\"".htmlspecialchars(trim($combobox[0]))."\">
      </div>
      <div class='col' style='width:30%; flex:auto; padding:0; padding-left:5px;'>
        <button id='team_rename' type='button' class='btn btn-primary' style='width:100%; height:100%; overflow: hidden;'>Изменить</button>
      </div>
      <div class='col' style='width:25%; flex:auto; padding:0; padding-left:5px;'>
        <button id='team_delete' type='button' class='btn btn-danger' style='width:100%; height:100%; overflow: hidden;'>Удалить</button>
      </div>
    </div>
    ";
  };
}


//............Изменить название команды.............
if (isset($_POST['team_rename']) && !empty($_SESSION['auth']) && access($connection) == 2) {
  $title = pg_escape_string($_POST['team_title']);
  $rename = trim(pg_escape_string($_POST['team_rename']));
  $sql = "SELECT DISTINCT team FROM users WHERE team = '".$rename."'";
  $res = pg_query($connection, $sql) or die("wait what\n");
  $row = pg_fetch_row($res);
  if ($title == $rename) {
    echo ("notification('Название команды не было изменено','rgba(255, 0, 0, 0.7)');");
  } else if ($row[0] == $rename || $rename == '' || $rename == 'Без команды') {
    echo ("notification('Название занято','rgba(255, 0, 0, 0.7)');");
  } else {
    $sql = "UPDATE users SET team = '".$rename."' WHERE team = '".$title."'; UPDATE users SET team = array_replace(team, '".$title."', '".$rename."');";
    pg_query($connection, $sql) or die("wait what\n");
    echo ("notification('Новое название команды \'".$rename."\'','rgba(53, 209, 29, 0.7)');");
    echo ("table_update();");
    echo ("teams_update();");
  }
}

//............Добавить команду.............
if (isset($_POST['team_add']) && !empty($_SESSION['auth']) && access($connection) == 2) {
  $title = trim(pg_escape_string($_POST['team_add']));
  $sql = "SELECT team FROM team WHERE team = '".$title."'";
  $res = pg_query($connection, $sql) or die("wait what\n");
  $row = pg_fetch_row($res);
  if ($row[0] != '' || $title == '' || $title == 'Без команды') {
    echo ("notification('Название занято','rgba(255, 0, 0, 0.7)');");
  } else {
    $sql = "INSERT INTO users (team) VALUES ('".$title."')";
    pg_query($connection, $sql) or die("wait what\n");
    echo ("notification('Команда создана','rgba(53, 209, 29, 0.7)');");
    echo ("teams_update();");
    echo ("$('#team_add').closest('.row').find('input').val('')");
  }
}

//............Удалить команду.............
if (isset($_POST['team_delete']) && !empty($_SESSION['auth']) && access($connection) == 2) {
  $title = pg_escape_string($_POST['team_delete']);
  $sql = "SELECT count(phone) FROM users WHERE '".$title."' = any(team) AND status = true AND 2 > array_length(team, 1)";
  $res = pg_query($connection, $sql) or die("wait what\n");
  $row = pg_fetch_row($res);
  if ($row[0] > 0) {
    echo "document.getElementById('teams').innerHTML = `
    <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;'>
      <div class='col'>
        <p class='fs-5 text-center'><b>".$row[0]."</b> человек останутся без команды, необходимо перенести их в другую.</p>
      </div>
    </div>
    <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;' title=\"".htmlspecialchars($title)."\">
      <div class='col align-items-center'>
        <button id='team_traveling' type='button' class='btn btn-primary' style='width:95%;'>Переместить</button>
      </div>
      <div class='col align-items-center'>
        <button id='team_back' type='button' class='btn btn-secondary' style='width:95%;'>Отмена</button>
      </div>
    </div>
    `;";
  } else {
    $sql = "DELETE FROM users WHERE team = '".$title."'";
    pg_query($connection, $sql) or die("wait what\n");
    echo ("notification('Команда удалена','rgba(53, 209, 29, 0.7)');");
    echo ("teams_update();");
  }
}

//............Перенести в другие команды(final).............
if (isset($_POST['team_change']) && !empty($_SESSION['auth']) && access($connection) == 2) {
  $travel_arr = $_POST['team_change'];
  $title = $_POST['title'];
  $sql = "DELETE FROM users WHERE team = '".$title."';";
  foreach ($travel_arr as $key => $value) {
    if ($value == 'deleteteamohno') {
      $sql = $sql."UPDATE users SET team = array_remove(team, '".$title."'); ";
    } else {
      if ($value == 'Оставить без команды') {
        $value = 'Без команды';
      };
      $sql = $sql."UPDATE users SET team = '{".$value."}' WHERE phone = '".$key."'; ";
    }
  }
  pg_query($connection, $sql) or die("wait what\n");
  echo ("notification('Команда удалена','rgba(53, 209, 29, 0.7)');");
  echo ("teams_update();");
  echo ("table_update();");
}

//............Перенести в другие команды..............
if (isset($_POST['team_traveling']) && !empty($_SESSION['auth']) && access($connection) == 2) {
  $title = pg_escape_string($_POST['team_traveling']);
  $sql = "SELECT DISTINCT team FROM users WHERE team != '".$title."'";
  $res = pg_query($connection, $sql) or die("wait what\n");
  $text = '';
  while ($combobox = pg_fetch_array($res)) {
    $text = $text."<option value='".$combobox[0]."'>".$combobox[0]."</option><br>";
  };
  echo "document.getElementById('teams').innerHTML = `
    <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;'>
      <div class='col-1'>
        <input id='team_checkbox_all' type='checkbox' class='form-check-input' title='все'>
      </div>
      <div class='col-4'>
      </div>
      <div class='col-7'>
        <select class='form-select' id='team_combobox''>
        <option value='Оставить без команды'>Оставить без команды</option>"
        .$text."
        </select>
      </div>
    </div>
    `;";
  $sql = "SELECT fio, profession, phone FROM users WHERE '".$title."' = any(team) AND status = true AND 2 > array_length(team, 1)";
  $res = pg_query($connection, $sql) or die("wait what\n");
  while ($row = pg_fetch_array($res)) {
    echo "document.getElementById('teams').innerHTML += `
    <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;'>
      <div class='col-1'>
        <input type='checkbox' class='form-check-input team_checkbox'>
      </div>
      <div class='col-11'>
        <input readonly type='text' class='form-control' number_phone='".$row[2]."' value=\"".htmlspecialchars($row[0])." (".htmlspecialchars($row[1]).")\">
      </div>
    </div>
    `;";
  }
  echo "document.getElementById('teams').innerHTML += `
    <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;' title='".$title."'>
      <div class='col align-items-center'>
        <button id='team_change' type='button' class='btn btn-primary' style='width:95%;'>Переместить</button>
      </div>
      <div class='col align-items-center'>
        <button id='team_back' type='button' class='btn btn-secondary' style='width:95%;'>Отмена</button>
      </div>
    </div>
    `;";
  $sql = "SELECT phone FROM users WHERE '".$title."' = any(team) AND status = true AND 1 < array_length(team, 1)";
  $res = pg_query($connection, $sql) or die("wait what\n");
  while ($row = pg_fetch_array($res)) {
    echo "travel_arr[".$row[0]."] = 'deleteteamohno';";
  }
}

//.......Изменение Календаря..............

if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest' && !empty($_POST['checkdaily'])) {
    $chatid = "SELECT chat_id FROM users WHERE phone='".$_POST['number']."'";
	$chatid = pg_query($connection, $chatid);
	$chatid = pg_fetch_assoc($chatid);
	
	if (empty($_POST['planedit'])) {
		$plan = "NULL";
	}
	else {
		$plan = "'".$_POST['planedit']."'";
	}
	if (empty($_POST['factedit'])) {
		$fact = "NULL";
	}
	else {
		$fact = "'".$_POST['factedit']."'";
	}
	if (isset($_POST['submit'])) {
    pg_query($connection, "UPDATE public.tasks SET plan=$plan, fact=$fact, hours='".$_POST['hoursedit']."', WHERE chat_id='".$chatid['chat_id']."' AND tasks.date='".$_POST['day']."'");
  }
	
}

//.......Команды (редактирование)..............
if (isset($_POST['edit_team']) && !empty($_SESSION['auth']) && (access($connection) == 1 || access($connection) == 2)) {
  $checked_arr=explode(', ', $_POST['edit_team']);
  $sql = "SELECT DISTINCT team FROM users";
  $res = pg_query($connection, $sql) or die("wait what\n");
  $text = "<div class='row gy-2 gx-3 align-items-center text-center'>";
  while ($combobox = pg_fetch_array($res)) {
    $text = $text." <div class='col-auto mx-auto' style = 'width:300px'> <div class='row'> <input ".($checked = (in_array($combobox[0], $checked_arr) ? 'checked' : ''))." type='checkbox' class='form-check-input' style='width:25px; height:25px; margin-top:7px; margin-right:10px;'> <input type='text' class='form-control' style = 'width:260px;' value=\"".htmlspecialchars($combobox[0])."\"> </div> </div>";
  };
  $text = $text."</div>";
  echo "document.getElementById('edit').innerHTML = ''; document.getElementById('edit').innerHTML += `".$text."`;";
  echo "document.getElementById('edit').innerHTML += `
  <div class='row align-items-center' style='width:100%; margin:0; margin-top:20px'>
    <div class='col-6'>
      <button id='edit_team_change' type='button' class='btn btn-primary' style='width:120px; float:right'>Изменить</button>
    </div>
    <div class='col-6'>
      <button id='edit_team_cancel' type='button' class='btn btn-secondary' style='width:120px; float:left'>Отмена</button>
    </div>
  </div>
  `;";
}
?>