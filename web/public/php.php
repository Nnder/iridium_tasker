<?php

//.........Выход.............
if(isset($_POST['button-exit']))
{
  $_SESSION['auth']='';
  $_SESSION['access']='';
}

//..........Информация о сотруднике...............
function getdata($connection, $tel)
{
    $query_employee = "SELECT * FROM users WHERE phone='$tel'";
    $result = pg_query($connection, $query_employee) or die('wait what');
    while ($row = pg_fetch_array($result)) {
        $phone=$row[0];
        $full_name=$row[2];
        $proffesion=$row[4];
        $team=$row[3];
        $access_level=$row[5];
        $chat_id=$row[1];
        $time = $row[6];
        $status=$row[7];
    }
    return array($phone, $chat_id, $full_name, $team, $proffesion, $access_level, $time, $status);
}

//...........Уровень доступа.................
function access($connection)
{
    $query = "SELECT role FROM users WHERE phone='".$_SESSION['auth']."'";
    $res = pg_query($connection, $query) or die('wait what');
    while ($row = pg_fetch_array($res)) {
        if ($row[0]!='' && $row[0] > 1){
            return $row[0];
        }
        else {
            $_SESSION['auth']='';
        }
    }
}
?>