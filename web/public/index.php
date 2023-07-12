<?php 
session_start();
include 'db.php'; 
include 'php.php';
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Iridi</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css?v=<?= time(); ?>" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/css/bootstrap-datepicker.min.css?v=<?= time(); ?>">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css?v=<?= time(); ?>">
  <link rel="stylesheet" href="airdatepicker/air-datepicker.css?v=<?= time(); ?>">
  <link rel="stylesheet" href="styles.css?v=<?= time(); ?>">
</head>
<?php
  if (!empty($_SESSION['auth'])) {
    access($connection);
  }
  $authimg = '';
  if(empty($_SESSION['auth'])){
    $authimg='authimg';
  }
  echo '<body class='.$authimg.'>';
  if(empty($_SESSION['auth'])) {
?>
<!-- Авторизация -->
  <div class="container h-100 d-flex justify-content-center" id="authid">
    <div class="my-auto auth d-flex flex-column">
      <div style="margin-top:15px">
        <p class="fs-3 text-center">Авторизация</p>
        <form onsubmit='return false' class="text-center mx-auto" style="margin-top:40px" id="auth">
          <div class="mb-3">
            <label for="InputTel" class="form-label">Введите номер телефона</label>
            <div class ='mx-auto'>
              <input readonly type='tel' class='form-control' style='width:20px; padding:6px 1px 6px 0px; margin-right:-5px; display:inline; border:none; border-radius:5px 0 0 5px;' onclick='this.nextElementSibling.focus();' value='+7'>
              <input autocomplete='off' onkeypress='return event.charCode >= 48 && event.charCode <= 57' type='tel' maxlength='10' class='form-control auth_enter' style='width:200px; padding-left:2px; display:inline; border:none; border-radius:0 5px 5px 0; outline:none; box-shadow: none;' id='InputTel' name='InputTel'>
            </div>
          </div>
          <button type="button" class="btn btn-primary auth_button" name="button-auth" onclick="auth_num()">Отправить</button>
          <p class='text-center' id ='auth-error' style='color:red; margin-top:10px'></p>
        </form>
      </div>
    </div>
  </div>
<?php
  }
  else {
?>
<!-- Навигационная панель -->
  <nav class="navbar navbar-expand-lg bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Iridi</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Переключатель навигации">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">       
      <button type="button" id="button_add" class="btn btn-success" style="margin-right: 10px;">Добавить сотрудника</button>      
        <button id='teams_but' type="button" class="btn btn-success" style="margin-right: 10px;">Команды</button>
        <button id='report_card' type="button" class="btn btn-success" style="margin-right: 10px;">Табель</button>
        <form method="POST"><button type="submit" class="btn btn-secondary" style="margin-right: 10px;" name="button-exit">Выход</button></form>
      </div>
    </div>
  </nav>
  <!-- Действия -->
  <form  class="form-filters" onsubmit="return false">
  <input type="hidden" id="selected" name="selected" value="">
    <div class="container-fluid" style="margin-left:0;">
      <div class="row">
      <div class="col-auto" style="min-width:300px; width:100%; max-width:500px">
        <label class="fs-4" for="search">Поиск</label>
        <input type="text" class="form-control filters" id="search" name="search" style="width:100%;" placeholder="Поиск">
      </div>
      <div class="col-auto active" style="display:inline-block">
        <input type="checkbox" class="form-check-input filters" id="active-check" name="active-check" value="true">
        <label for="active-check">Показывать неактивных</label>
      </div>
      </div>
    </div>
  </form>
<div class="container-fluid">
  <div class="row">
    <!-- Список сотрудников -->
    <div id="left" style="padding:0">
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <form class="form-filters">
            <tr>
              <input type="hidden" id="sort-check" name="sort" value="fio" sort="ASC">
              <th scope="col">
                <div class="sort" value="phone">Номер телефона</div>
              </th>
              <th scope="col">
                <div class="sort" value="fio">ФИО ↑</div>
              </th>
              <th scope="col" class='post-report'>
                <div class="sort" value="profession">Должность</div>
                <select class="form-select filter-select filters" name="filter-post" id="filter-post">
                  <option value="Все">Все</option>
                  <?php
                    $sql = "SELECT DISTINCT profession FROM users";
                    //$sql = "SELECT profession FROM users WHERE profession != '' AND role<".access($connection)." AND status != 'false' OR phone = '".$_SESSION['auth']."' GROUP BY profession";
                    $res = pg_query($connection, $sql) or die("wait what\n");
                    while ($combobox = pg_fetch_array($res)) {
                    ?>
                      <option value="<?=$combobox[0]?>"><?=$combobox[0]?></option>
                    <?php
                    }
                  ?>
                </select>
              </th>
              <th scope="col" class='team-report'>
                <div class="sort" value="team">Команда</div>
                <select class="form-select filter-select filters" name="filter-team" id="filter-team">
                  <option value="Все">Все</option>
                  <?php
                    $sql = "SELECT DISTINCT team FROM users";
                    $res = pg_query($connection, $sql) or die("wait what\n");
                    while ($combobox = pg_fetch_array($res)) {
                    ?>
                      <option value="<?=$combobox[0]?>"><?=$combobox[0]?></option>
                    <?php
                    }
                  ?>
                </select>
              </th>
              <th class='text-center actions' style="width:150px;" scope="col">Действия</th>
            </tr>
            </form>
          </thead>
          <tbody id ="table">

          </tbody>
        </table>
      </div>
    </div>
    <!--Отчет-->
    <div style="box-sizing: content-box !important;padding:0; width:0; overflow: hidden;all: inherit;" id="report">
    </div>
	<div style="box-sizing: content-box !important;margin-left: 5vw;padding:0; width:0; overflow: hidden;" id="Daily">
    </div>
  </div>
</div>
<!-- Модальное окно (Редактирование) -->
<div class="modal fade" id="Modal" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" style="--bs-modal-width: auto; margin:0 5vW;">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5">Редактирование сотрудника</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="edit">
        
      </div>
    </div>
  </div>
</div>
<!-- Модальное окно (Добавление) -->
<div class="modal fade" id="modal_add" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" style="--bs-modal-width: auto; margin:0 5vW;">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5">Добавление сотрудника</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="btn-close-add"></button>
      </div>
      <div class="modal-body">
        <form onsubmit="return false;" class="row gy-2 gx-3 align-items-center text-center formsql" name="button-add">
          <input type="hidden" name="button-form" value="button-add">
          <div class="col-auto mx-auto">
            <label for="number_phone">Номер телефона</label>
            <div>
              <input readonly type='tel' class='form-control' style='width:20px; padding:6px 1px 6px 0px; margin-right:-5px; display:inline; border-right:none; border-radius:5px 0 0 5px; outline:none; box-shadow: none;' onclick='this.nextElementSibling.focus();' value='+7'>
              <input autocomplete='off' onkeypress='return event.charCode >= 48 && event.charCode <= 57' type='tel' maxlength='10' class='form-control' style='width:200px; padding-left:2px; display:inline; border-left:none; border-radius:0 5px 5px 0; outline:none; box-shadow: none;' id='add_number_phone' name='add_number_phone'>
            </div>
            <label class='number-error' style="color:red"></label>
          </div>
          <div class="col-auto mx-auto">
            <label for="full_name">ФИО</label>
            <input type="text" class="form-control" id="add_full_name" name="add_full_name" maxlength="100">
            <label class='' style="color:red"></label>
          </div>
          <div class="col-auto mx-auto">
            <label for="add_post">Должность</label>
            <input type="text" class="form-control" name="add_post" id="add_post" maxlength="100">
            <label class='' style="color:red"></label>
          </div>
          <div class="col-auto mx-auto">
            <label for="add_team">Команда</label>
            <input type="text" name="add_team" id="add_team" list="choose_team" class="form-select" maxlength="100">
            <datalist id='choose_team'>          
            <?php
               $sql_com = "SELECT DISTINCT team FROM users";
               $rescom = pg_query($connection, $sql_com) or die("wait what\n");
               while ($combobox = pg_fetch_array($rescom)) {
                 echo "<option value='".trim($combobox[0])."'>";
               }
            ?>            
            <option value='Без команды'>
            </datalist>
            <label class='' style="color:red"></label>
          </div>
          <div class="col-auto mx-auto">
            <label for="access_level">Уровень доступа</label>
            <select class="form-select" name="add_access_level" id="add_access_level">
              <option value="1" name="access_level">Admin</option>
              <option value="2" name="access_level">SuperAdmin</option>
            </select>
            <label class='' style="color:red" ></label>
          </div>
          <div class="mx-auto" style="margin-top:0px">
            <button type="submit" class="btn btn-primary" id="btn-add-close">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
<!--.............Список действий..........-->
<div class="modal" id="list" aria-hidden="true">
  <div class="modal-dialog custom-class" id="list_content" style=" margin:0; width:150px;">
    <div class="modal-content">
    <button class='but_edit' id='modal_but_edit'>Редактировать</button>
    <button>Отчет</button>
    </div>
  </div>
</div>
<!--...........Команды............-->
<div class="modal fade" id="modal_teams" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered mx-auto" style="max-width:95%; width:500px;">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5">Команды</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" >
        <form onsubmit="return false;" class="row gy-2 gx-3 " id = 'teams' style = 'width: 100%; margin: 0'>
        </form>
      </div>
    </div>
  </div>
</div>
<!--.........Табель.............-->
<div class="modal fade" id="modal_report_card" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered mx-auto" style="width:280px;">
    <div class="modal-content">
      <div class="modal-body" id="report_card_calendar">
      </div>
    </div>
  </div>
</div>
<?php
  }
?>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js?v=<?= time(); ?>"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js?v=<?= time(); ?>" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/js/bootstrap-datepicker.min.js?v=<?= time(); ?>"></script>
<script src="airdatepicker/air-datepicker.js?v=<?= time(); ?>"></script>
<script src="scripts.js?v=<?= time(); ?>"></script>
</body>
</html>