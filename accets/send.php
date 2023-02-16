<?php 
    // Принимаем и парсим json
    header("Content-Type: application/json");
    $clientData = json_decode(file_get_contents("php://input"), true);
    
    // Разбиваем масив данных на темы
    $clientFile       = $clientData['files'];
    $clientDb         = $clientData['db'];
    $clientInData     = $clientData['inputsData'];
    $clientSql        = $clientData['sql'];
    $clientDataId     = $clientData['id'];
    $fileNameToColumn = $clientData['fileNameToColumn'];
    $deleteFile       = $clientData['deleteFile'];
    $deleteDir        = $clientData['deleteDir'];
    $tgInputs         = $clientData['tgInputs'];
    $tgConnection     = $clientData['tgConnection'];
    
    $mainFolder = $_SERVER['DOCUMENT_ROOT'];
    
    $fileNameString = '';

    // Если нужно Удалить файл
    if ($deleteFile) {
        foreach ($deleteFile as $val) {
            $val = trim($val);
            if (file_exists("$mainFolder$val")) {
                unlink("$mainFolder$val"); 
            }
        }
    }
    
    // Если нужно Удалить директорию
    if ($deleteDir) {
        function dirDel ($dir) {  
            $d=opendir($dir);  
            while(($entry=readdir($d))!==false) 
            { 
                if ($entry != "." && $entry != "..") 
                { 
                    if (is_dir($dir."/".$entry)) 
                    {  
                        dirDel($dir."/".$entry);  
                    } 
                    else 
                    {  
                        unlink ($dir."/".$entry);  
                    } 
                } 
            } 
            closedir($d);  
            rmdir ($dir);  
        } 
        foreach ($deleteDir as $val) {
            dirDel("$mainFolder$val");
        }
    }
    
    
    // Если нужно загрузить файл
    if ($clientFile) {
        
        // Функция для создания директории
        function createPath($path) {
            if (is_dir($path)) 
                return true;
            $prev_path = substr($path, 0, strrpos($path, '/', -2) + 1 );
            $return = createPath($prev_path);
            return ($return && is_writable($prev_path)) ? mkdir($path) : false;
        }
        
        
        foreach ($clientFile as  $file) {
            // полная директория
            $dir = $mainFolder.$file['uploadDir'];
            $fileName = $file['fileName'];
            
            // запуск функции если не находится директория
            if (!is_dir($dir)) {
                createPath($dir);
            }
            
            // Загрузка файла на сервер
            copy($file['uploadSrc'], "$dir$fileName");
            
            // Если данные файла нужно внести в Базу Данных
            if ($fileNameToColumn) {
                $fileNameString = "$fileNameString $fileName, ";
            }

        }
    }
    
    // Функция работы с БД
    function sendFn($executeArray, $allColumns, $allValues, $clientSql, $clientDb, $clientDataId, $fileNameToColumn, $fileNameString) {
        
        $dbhost = $clientSql['dbhost'];
        $dbname = $clientSql['dbname'];
        $charset = $clientSql['charset'];
        $login = $clientSql['login'];
        $pass = $clientSql['pass'];
        $table = $clientDb['table'];
        $request = $clientDb['request'];
        $sqlIdColumn = $clientDataId['id'];
        $sqlIdValue = $clientDataId['value'];

        
        
        if ($clientSql) {
            // подключение к Базе Данных
            $pdo = new PDO("mysql: dbhost=$dbhost; dbname=$dbname; charset=$charset", $login, $pass);
            switch ($request) {
                case 'INSERT':
                    // преобразуем все колонки в строку
                    $allColumnsSql = implode("," , $allColumns);
                    
                    // преобразуем все значения в массив
                    for ($i=0; $i < count($allColumns); $i++) { 
                        $allColumns[$i] = ":$allColumns[$i]";
                    }
                    
                    if ($fileNameToColumn ) {
                        $executeArray[$fileNameToColumn] = $fileNameString;
                    }
                    
                    // преобразуем все значения в строку
                    $allColumns = (implode("," , $allColumns));
                    
                    // SQL Запрос
                    $sql = "INSERT INTO `$table` ($allColumnsSql) VALUES ($allColumns)";
                    $query = $pdo->prepare($sql);
                    $query->execute($executeArray);
                    
                    break;
                    
                case 'UPDATE':
                    // Преобразуем все колонки и значения в строку
                    $flattened = $executeArray;
                    array_walk($flattened, function(&$value, $key) {
                        $value = "`{$key}`='$value'";
                    });
                    $executeArray = implode(', ', $flattened);
                    
                    // SQL Запрос
                    
                    $sql = "UPDATE `$table` SET $executeArray WHERE $sqlIdColumn = $sqlIdValue";
                    $query = $pdo->prepare($sql);
                    $query->execute();
                    break;
                    
                case 'DELETE':
                    $sql = "DELETE FROM `$table` WHERE $sqlIdColumn = $sqlIdValue";
                    $query = $pdo->prepare($sql);
                    $query->execute();
                    break;
                
                default:

                    break;
            }
            
        }
    }
    
    
    
    
    // Если нужно работать с БД
    if ($clientDb) {
        $allValues    = [];
        $allColumns   = [];
        $executeArray = [];

        
        if ($clientInData) {
            
            // Разбивка масива на данные и колонки
            foreach ($clientInData as $input){
                if (isset($input['column']) && isset($input['value'])) {
                    array_push($allColumns, $input['column']);
                    array_push($allValues, $input['value']);
                }
                $executeArray[$input['column']] = $input['value'];
            };
            
        }
        sendFn($executeArray, $allColumns, $allValues, $clientSql, $clientDb, $clientDataId, $fileNameToColumn, $fileNameString);
        
    }
    
    // Отправка данных в тг
    if ($tgConnection) {
        
        $token = $tgConnection['token'];
        $chat_id = $tgConnection['chatId'];
        $txt = '';
        
        foreach($tgInputs as $input) {
            $columntg = $input['column'] ;
            $val = $input['val'];
            // $txt .= "<b>$columntg</b>" . "$val"." %0A";
            // $txt .= "<b>".$columntg."</b> ".$val."%0A";
            $txt .= $columntg." ".$val."%0A";
        };
        var_dump($txt);

          $sendToTelegram = fopen("https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&parse_mode=html&text={$txt}","r");

        //   $sendToTelegram = fopen("https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&parse_mode=html&text={$txt}","r");
          
          if ($sendToTelegram) {
  
            echo "True";
          
          } else {
          
            echo "Error";
        }
          
    }
    

    // header("Location: $mainFolder../index2.php")
    // header("Location: /index2.php");

    

?>