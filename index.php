<div id="block"></div>
<style>
    body.loading{
        background: #000;
        color: #fff;
    }
    body.sucses{
        background: #66ff00;
        color: #fff;
    }
    body.sending{
        background: yellow;
        color: #fff;
    }
    .ef__preview-img{
        max-width: 250px;
        max-height: 100%;
        width: auto;
        height: auto;
        margin: 8px;
        border-radius: 8px;
        display: block;
    }
    .preview{
        display: flex;
        flex-wrap: wrap;
    }
    .ef__preview-wrapper{
        position: relative;
    }
    
    .ef__preview__btn-close{
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 600;
        position: absolute;
        top: 0;
        right: 0;
        font-size: 30px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        background: red;
        color: #fff;
    }
    .ef__preview__btn-close:hover{
        background: #ff1f1f;
    }
</style>

<form style="padding: 20px" class="form-test">
    <input type="text" value="" sqlColumn="person" >
    <input type="date" value="" sqlColumn="time">
    <!-- <input type="text" value="" sqlColumn="comment"> -->
    <input type="file" sqlColumn="comment">
    <div class="" deleteFileUrl="./upload/hjkjh/khkh/fh/1675549278452DSC_0032.JPG"></div>
    
    <button type="submit">Submit</button>
    <div class="preview"></div>
    <!-- <div class="file-error"></div> -->

</form>

<a href="./index2.php">asdasdasd</a>

<!-- 
<form style="padding: 20px" class="form-test2">
    <input type="text" value="" sqlColumn="person">
    <input type="date" value="" sqlColumn="date">
    <input type="text" value="" sqlColumn="comment">
    <input type="text" value="" sqlColumn="img">
    <button type="submit">Submit</button>
</form>

<form enctype="multipart/form-data" class="form-test4">
    <input type="file" sqlColumn="img6969">
    <button type="submit">Submit</button>
<div class="preview"></div>
    
</form>-->

<?php
    include "pdo.php";
    $id = $_GET['id'];
    $sql = "SELECT * FROM `comments` WHERE id='$id'";
    $query = $pdo->prepare($sql);
    $query->execute();
    $news = $query->fetch(PDO::FETCH_ASSOC);
?>


<form style="padding: 20px" class="form-test2">
    <input type="text" value="<?php echo $news['person'] ?>"  sqlColumn="person">
    <input type="date" value="<?php echo $news['time'] ?>"    sqlColumn="time">
    <input type="text" value="<?php echo $news['comment'] ?>" sqlColumn="comment">

    <input type="text" sqlColumnId="id" sqlValueId="<?php echo $id ?>" hidden>
    <button type="submit">Submit</button>
</form> 

<form class="form-test3">
    <button type="submit" sqlColumnId="id" sqlValueId="<?php echo $id ?>">Delete</button>
</form>

<form class="form-test4">
    <button type="submit" deleteDirUrl="/upload/hjkjh/" deleteFileUrl="./upload/1675516781446Arial.zip">Delete</button>
</form>
<form class="form-test5">
    <input type="text" tgColumn="<b>что-то</b>"> <!-- Э, И -->
    <input type="date" tgColumn="Дата ">
    <textarea tgColumn="Сообщение" cols="30" rows="10">
        
    </textarea>

    <button type="submit">Отправить</button>
</form>

<div class="result"></div>
<script src="./script0.js"></script>