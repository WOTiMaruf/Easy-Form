<?php 
    header("Content-Type: application/json");
    $formFile = file_get_contents("php://input");
    $formInputs = json_decode(file_get_contents("php://input"), true);
    var_dump($formInputs);
    if ($formInputs["fileName"]) {
        if ($formInputs["rename"] === true) {
            $formInputs["fileName"] = time().$formInputs["fileName"];
        }
        copy($formInputs['uploadSrc'], $formInputs['uploadDir'] . $formInputs['fileName']);
    }

    $id = $_GET['id'];
    $sqlTabel = end($formInputs)['table'];
    $sqlRequest = end($formInputs)['request'];
    $formInputs = array_slice($formInputs, 0, -1);
    $allColumns = [];
    $allValues = [];
    $executeArray = [];

    foreach ($formInputs as $input){
        if (isset($input['column']) && isset($input['value'])) {
            array_push($allColumns, $input['column']);
            array_push($allValues, $input['value']);
        }
        $executeArray[$input['column']] = $input['value'];
        var_dump($executeArray);
    };
    
    
    
    include "./pdo.php";
    switch ($sqlRequest) {
        case "INSERT":
            // преобразуем все колонки в строку
            $allColumnsSql = implode("," , $allColumns);
            
            // преобразуем все значения в массив
            for ($i=0; $i < count($allColumns); $i++) { 
                $allColumns[$i] = ":$allColumns[$i]";
            }
            
            // преобразуем все значения в строку
            $allColumns = (implode("," , $allColumns));
            
            // SQL Запрос
            $sql = "INSERT INTO `$sqlTabel` ($allColumnsSql) VALUES ($allColumns)";
            $query = $pdo->prepare($sql);
            $query->execute($executeArray);
            
            break;
            
        case "UPDATE":
            // Преобразуем все колонки и значения в строку
            $flattened = $executeArray;
            array_walk($flattened, function(&$value, $key) {
                $value = "{$key}='$value'";
            });
            $executeArray = implode(', ', $flattened);
            
            // SQL Запрос
            $sql = "UPDATE `$sqlTabel` SET $executeArray WHERE id = '$id'";
            $query = $pdo->prepare($sql);
            $query->execute();
            
            break;
            
        default:
            echo 'INCORRECT VALUE OF ATTRIBUTE IN FORM "sqlRequest" ';

            var_dump($formInputs);
            break;
        }

?>