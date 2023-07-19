<?php 
    session_start();
    include 'db.php';
    include 'php.php';
      $employee = getdata($connection, $_GET["tel"]);
      if(!empty($_SESSION['auth'])) {
      ?>
      <form onsubmit="return false;"  class="row gy-2 gx-3 align-items-center text-center formsql" name="button-save" id="form_edit">
        <input type="hidden" name="button-form" value="button-save">
        <div class="col-auto mx-auto">
            <label for="chat-id">Chat ID</label>
            <input type="text" class="form-control" id="chat_id" name="chat_id" value="<?php echo(trim($employee[1])) ?>">
          </div>
          <div class="col-auto mx-auto">
            <label for="number_phone">Номер телефона</label>
            <input type="text" class="form-control" id="number_phone" name="number_phone" value="+<?php echo(trim($employee[0])) ?>" maxlength="12">
          </div>
          <div class="col-auto mx-auto">
            <label for="full_name">ФИО</label>
            <input type="text" class="form-control" id="full_name" name="full_name" value="<?php echo(trim($employee[2])) ?>">
          </div>
          <div class="col-auto mx-auto">
            <label for="post">Должность</label>
            <input type="text" class="form-control" name="post" id="post" value="<?php echo(trim($employee[4])) ?>">
          </div>
          <div class="col-auto mx-auto">
            <label for="team">Команда</label>
            <input type="text" class="form-control" name="team" id="team" value="<?php echo(trim($employee[3])) ?>">
          </div>
          <div class="col-auto mx-auto">
            <label for="access_level">Уровень доступа</label>
            <select class="form-select" name="access_level" id="access_level">
              <option value="1" name="adm-opt">Пользователь</option>
              <option value="2" name="sup-adm-opt">ТимЛид</option>
              <option value="3" name="sup-adm-opt">СТО</option>
            </select>            
          </div>              
          <div class="col-auto mx-auto">
            <label for="team">Часы работы</label>
            <input type="text" class="form-control" name="work_time" id="work_time" value="<?php echo(trim($employee[6])) ?>">
          </div>
          <div class="col-auto mx-auto">
            <label for="active"></label>
            <input <?php if ($employee[7] == true) { ?>checked<?php }?> style="margin-top:30%" type="checkbox" class="form-check-input" id="active" name="active" value="true">
            <label style="margin-top:23%" for="active">Active</label>
          </div>
          <?php
          //if ($employee[5] < access($connection)){
          ?>
          <div class="mx-auto" style="margin-top:15px">          
            <button type="submit" class="btn btn-primary" name="button-save">Сохранить изменения</button>
          </div>
        </form>
<?php
//}
}
?>
        