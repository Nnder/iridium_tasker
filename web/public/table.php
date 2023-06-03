<?php
    include "db.php";
    include "php.php";
    session_start();

    function mb_ucfirst($string, $encoding = 'UTF-8') {
        $firstChar = mb_substr($string, 0, 1, $encoding);
        $restOfString = mb_substr($string, 1, null, $encoding);
        $uppercasedFirstChar = mb_strtoupper($firstChar, $encoding);
        return $uppercasedFirstChar . $restOfString;
    }

    if(!empty($_SESSION['auth'])) {
        $query = "SELECT number_phone, full_name, post, array_to_string(team, ', ', '') FROM personals WHERE (number_phone = '".$_SESSION['auth']."' OR access_level<=".access($connection).")";
        if (isset($_GET['filter-post']) && $_GET['filter-post']!='Все'){
            $query .= " AND post = '".$_GET['filter-post']."'";
        }
        if (isset($_GET['filter-team']) && $_GET['filter-team']!='Все'){
            $query .= " AND '".$_GET['filter-team']."' = any(team)";
        }
        if (isset($_GET['active-check']) && $_GET['active-check']=='Y'){
            $query .= " AND active != ''";
        }
        else{
            $query .= " AND active != 'N'";
        }
        if (isset($_GET['search']) && $_GET['search']!=''){                    
            $search=trim(pg_escape_string($_GET['search'])); 
            $search= mb_ucfirst($search);             
            if (mb_substr($search,0,1)=='+'){
                $search=substr($search,1,mb_strlen($search));
            }
            $query .= " AND number_phone iLIKE '%".$search."%' OR full_name iLIKE '%".$search."%' OR post iLIKE '%".$search."%' OR array_to_string(team, ' ') iLIKE '%".$search."%'"; 
            
            $search = mb_strtolower($search, 'UTF-8');
            if (mb_substr($search,0,1)=='+'){
                $search=substr($search,1,mb_strlen($search));
            }
            $query .= " AND number_phone iLIKE '%".$search."%' OR full_name iLIKE '%".$search."%' OR post iLIKE '%".$search."%' OR array_to_string(team, ' ') iLIKE '%".$search."%'"; 
        }
        if (isset($_POST['sort'])){
            $query .= " ORDER BY ".$_POST['sort']." ".$_POST['type'];
        }
        else {
            $query .= " ORDER BY full_name ASC";
        }
        $rs = pg_query($connection, $query) or die("wait what\n");
        while ($row = pg_fetch_array($rs)) {
            if ($row[7]=='N'){
                $NonActive='NonActive';
            }
            else {
                $NonActive='';
            }
            if (isset($_GET['selected']) && $row[0]==$_GET['selected']){
                $selected='row_selected';
            }
            else{
                $selected='';
            }
            echo 
            "
            <tr class='emp_edit $NonActive $selected' value='$row[0]'>
            <td style='max-width: 12.5vw;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;'>+$row[0]</td>
            <td style='max-width: 12.5vw;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;'>$row[1]</td>
            <td class='post-report' style='max-width: 10.5vw;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;'>$row[2]</td>
            <td class='team-report' style='max-width: 10.5vw;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;'>$row[3]</td>
            <td class='text-center actions' style='max-width: 12.5vw;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;'><button class='but_edit' value='$row[0]'>Ред.</button> <button class='but_report' value='$row[0]'>Отч.</button></td>
            </tr>
            ";
        }
    }
?>