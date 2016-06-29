<?php
    /*Enable Error Reporting for Debug reasons*/
    error_reporting(E_ALL);

    /*Check which Parameters we got*/
    if(isset($_GET['m'])) $m=$_GET['m']; else $m='';
    if(isset($_GET['typid'])) $typid=$_GET['typid'];
    if(isset($_GET['dist'])) $dist=$_GET['dist']; //Kilometer
    if(isset($_GET['lat'])) $lat=$_GET['lat'];
    if(isset($_GET['lng'])) $lng=$_GET['lng'];

    /*Create Database Connection*/
    $mysqli = new mysqli("localhost", "d0140c6c", "U48KaAJ33q7UdVzq", "d0140c6c");

    /*Exit on Database Connection Error*/
    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
        exit();
    }

    /*Mode-Switch (getTyp, addSpeedcam or getSpeedcams*/
    switch($m){
        case 'getTyp' :
            $query = "SELECT id, typ, icon FROM typ ORDER BY id";
            break;
        case 'add' :
            $query = "INSERT INTO speedcam (lat, lng, typId) VALUES (".$lat.",".$lng.",".$typid.")";
            $mysqli->query($query);

            $query= "SELECT typId, lat, lng FROM speedcam WHERE id=".$mysqli->insert_id;
            break;
        default :
            $query = "SELECT typId, lat, lng, ( 6371 * acos( cos( radians( ".$lat." ) ) *
                      cos( radians( lat ) ) * cos( radians( lng ) - radians( ".$lng." ) ) +
                      sin( radians( ".$lat." ) ) * sin( radians( lat ) ) ) ) AS dist
                      FROM speedcam HAVING dist <".$dist." ORDER BY dist";
            break;
    }

    /*Set Header to JSON and return data*/
    if ($result = $mysqli->query($query)) {

        header('Content-type: text/json');
        header('Content-type: application/json');

        while($data = $result->fetch_assoc()) {
            $json[] = $data;
        }
        $result->free();
        echo json_encode($json);
    }

    $mysqli->close();
?>