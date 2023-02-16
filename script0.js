class EasyForm {
    constructor(selector, settings){
        
        // Получаем форму через селектор
        this.form = document.querySelector(selector)
        
        // расположение файла php в проекте 
        this.phpUrlFile = settings.phpUrlFile
        
        // Таблица куда нужно внести данные
        this.sqlTable = settings.sqlTable
   
        // Тип запроса SQL (Insert || Update || Delete)
        this.sqlRequest = settings.sqlRequest
      
        // функция htmlspecialchars из php
        this.htmlspecialchars = settings.htmlspecialchars
      
        // errorLog
        this.debugItem = document.querySelector(settings.debugItem)
        
        // Input with files
        this.formInputFile = this.form.querySelector('input[type="file"]');

        // preview
        this.preViewItem = document.querySelector(settings.preView)
        
        // Удаление превьюшки
        this.preViewDelete = settings.preViewDelete
        
        // Текст превьюшки
        this.preViewDeleteInner = settings.preViewDeleteInner
        
        // upload file
        this.upload = settings.upload
        
        // Удаляемый файл
        this.deleteFilesUrl = []
        
        // Удаляемые директории
        this.deleteDirsUrl = []
        
        // url of upload dir
        this.uploadDir = settings.uploadDir
        
        // Расширение разрешённых файлов на загрузку
        this.fileType = settings.fileType
        
        // Чат куда отправлять сообщение
        this.chatId = settings.chatId
        
        // бот токен
        this.botToken = settings.botToken
        
        // Размер [ не имеет значение)) ] файлов на загрузку в MегаБайтах
        this.fileSize = +settings.fileSize
        
        // Информация о файле
        this.fileInfo = []
        
        // Информация о форме для телеграмма
        this.tgInputs = []
        
        // Масив файлов для загрузки
        this.fileInfoSend = []
        
        // Колличество файлов для загрузки
        this.fileCount = 0
     
        // Переименование файлов на загрузку
        this.renameFile = settings.renameFile
        
        // Путь файлов для загрузки
        this.formInputs = []
        
        // Объект для отправки файлов
        this.data = {}
        
        // Отправка пользователя на другую страницу
        this.header = settings.header
        
        // Файл для подключения к БД
        // this.connection = settings.connection
        
        // Индификатор колонки для обновления БД
        this.sqlColumnId = settings.sqlColumnId 
        
        // Индификатор значения колонки для обновления БД
        this.sqlValueId = settings.sqlValueId 
        
        
        this.listeners();
    }
    
    // Запуск слушателя событий
    listeners(){
        this.checker(this)
        if (this.upload && this.uploadDir) {
            //Проверка на наличие input type file
            if (this.formInputFile) {
                this.formInputFile.addEventListener('change', this.fileCheck.bind(this))
                
                // проверка на наличие атрибута при множественной загрузки
                if (this.upload === 'single') {
                    this.formInputFile.removeAttribute("multiple")
                }
                else{
                    this.formInputFile.setAttribute("multiple", true)
                }
            }
            else{
                // Eror that it's not a input type file(
            }

        }
        // Вешаем событие на собирание даных при отправке
        this.form.addEventListener('submit', this.catchAllData.bind(this))
        
    }
    
    // Проверка всех переменных
    checker(){
        //Проверка всех настроек
        if (this.selector === 'general-settings') {this.globalSettings.bind(this)}
        if (!this.form) {return false}
        if (typeof this.phpUrlFile !== 'string' || this.phpUrlFile.trim() == '') {this.phpUrlFile = window.EFphpUrlFile}
        if (typeof this.connection !== 'string' || this.connection.trim() == '') {return false}
        if (typeof this.sqlTable !== 'string' || this.sqlTable.trim() == '') {this.sqlTable = false}
        if (typeof this.preViewDeleteInner !== 'string') {this.preViewDeleteInner = false}
        if (typeof this.preViewDelete !== true ) {this.preViewDelete = false}
        if (typeof this.botToken !== 'string' || this.botToken.trim() == '') {this.botToken = false}
        if (typeof this.chatId !== 'string' || this.chatId.trim() == '') {this.chatId = false}
        if (typeof this.header !== 'string' || this.header.trim() == '') {this.header = false}
        if (typeof this.sqlRequest !== 'string' || this.sqlRequest.trim() == '') {this.sqlRequest = false}
        if (typeof this.htmlspecialchars !== 'boolean') {this.htmlspecialchars = false}
        if (typeof this.uploadDir !== 'string' || this.uploadDir.trim() == '') {this.uploadDir = false}
        if (typeof this.renameFile !== 'boolean') {this.renameFile = false}
        if (!this.debugItem) {this.debugItem = false}
        if (!this.preViewItem) {this.preViewItem = false}
        if (!this.fileType || this.fileType.length == 0) {this.fileType = false}
        if (!this.fileSize) {this.fileSize = false}
        if (this.upload === "single" || this.upload === "multy") {} else{this.upload = false}
    }
    
    // Проверка файла 
    fileCheck(){
        // Собираем данные файлов и очищаем Лог ошибок
        this.fileInfoSend = []
        let formFiles = this.formInputFile.files
        let errorLog = this.form.querySelector('.file-error')
        if (errorLog) {
            errorLog.innerHTML = ''
        }

        for (const file of formFiles) {
            
            // Создаём панель с выводом ошибки файла
            if (!this.form.querySelector('.file-error')) {
                let error = document.createElement('div');
                error.classList.add('file-error');
                this.form.appendChild(error)
            }
            const errorLog = this.form.querySelector('.file-error');
            
            // Узнаём расширение файла
            function fileMime(name) {
                return name.match(/\.([^.]+)$|$/)[1]
            }
            
            // Проверка на расширение фала
            if (this.fileType) {
                if (!this.fileType.includes(fileMime(file.name))) {
                    errorLog.innerHTML += ` Недопустимый формат файла! <b>${file.name}</b> <br>`;
                    this.preViewItem.innerHTML = ''
                    console.log(`Недопустимый формат файла - ${file.name}`);
                    
                    continue;
                }
            }
            
            // Проверка на размер фала
            if (this.fileSize) {
                if (file.size > this.fileSize * 1024 * 1024) {
                    errorLog.innerHTML +=  ` Этот файл слишком большой! <b>${file.name}</b> <br>`;
                    this.preViewItem.innerHTML = ''
                    console.log(`Большой размер файла - ${file.name}`);
    
                    continue;
                }
            }

            
            // Отчиска превью если есть такая настройка
            if (this.preViewItem) {
                this.preViewItem.innerHTML = ''
            }
            // Загрузка файла
            ++this.fileCount
            this.fileLoad(file);
            
        }
    }
    
    // переименование файла
    rename(){
        // генератор имени нового фала
        const time = new Date();
        const year = time.getFullYear();
        const month = time.getMonth();
        const day = time.getDay();
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const mseconds = time.getMilliseconds();
        return Date.UTC(year, month, day, hours, minutes, seconds, mseconds);
    }
    
    // Загрузка файла
    fileLoad(file){
        EFFileLoading(this.form, this.fileCount)
        // Загружаем картинки
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.addEventListener('load', (e)=>{
            if (this.uploadDir[this.uploadDir.length - 1] !== "/") {
                this.uploadDir = `${this.uploadDir}/`
            }
            // объект с данными файла
            this.fileInfo = {
                uploadSrc: e.target.result, 
                fileName: this.rename() + file.name,
                uploadDir: this.uploadDir,
            };
            // добавляем файл в массив для отправки
            this.fileInfoSend.push(this.fileInfo)
            // выводим превью
            if (this.preViewItem) {
                if (this.preViewDelete) {
                    // Кнопка для удаления превью
                    let delBtn = `<span class="ef__preview__btn-close">+</span>`
                    if (this.preViewDeleteInner) {
                        delBtn = `<span class="ef__preview__btn-close">${this.preViewDeleteInner}</span>`
                    }
                    
                    this.preViewItem.innerHTML += 
                    `<div class="ef__preview-wrapper">
                        <img src="${e.target.result}" alt="${file.name}"class="ef__preview-img">
                        ${delBtn}
                    </div>`;
                    
                    let wrappers = document.querySelectorAll('.ef__preview-wrapper');
                    
                    for (const item of wrappers) {
                        const wraperBtn = item.querySelector('.ef__preview__btn-close');
                        
                        wraperBtn.addEventListener('click', ()=> {
                            const wraperFile = item.querySelector('.ef__preview-img').src;
                            
                            // Функция для удаления файла из масива 
                            // for (const file of this.fileInfoSend) {
                            //     if (file.uploadSrc == wraperFile) {
                            //         file.splice()
                            //     }
                            // }
                            this.fileInfoSend = this.fileInfoSend.filter(n => n.uploadSrc !== wraperFile)
                            item.remove()
                            
                            console.log(this.fileInfoSend);
                        });
                        // console.log(item);
                    }
                    
                }
                else{
                    this.preViewItem.innerHTML += 
                    `<div class="ef__preview-wrapper">
                        <img src="${e.target.result}" alt="${file.name}"class="ef__preview-img">
                    </div>`;
                }
            }
        })
        reader.addEventListener('loadstart', (e)=>{
            // console.log('Load Start');
        })
        reader.addEventListener('load', (e)=>{
            // console.log('Load');
            
        })
        reader.addEventListener('progress', (e)=>{
            // console.log('Progress');
            
        })

        reader.addEventListener('loadend', (e)=>{
            --this.fileCount
            EFFileLoading(this.form ,this.fileCount)
        })

        reader.addEventListener('error', (e)=>{
            // действия при ошибке загрузки фала
            this.preViewItem.innerHTML += `Ошибка при загрузке. Попробуйте снова`;
            --this.fileCount
        })
    }
    
    // htmlspecialchars в php
    convertHtmlSpecialChars(text) {
        // функция htmlspecialchars из php
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    // Функция для собирания данных
    catchAllData(e){
        // остановка отправки и очистка массива данных формы
        e.preventDefault();
        this.formInputs = []
        
        // Собираем данные у инпутов с атрибутом
        for (const input of this.form.children) {
            let inputAtr = input.getAttribute("sqlcolumn");
            let tgColumn = input.getAttribute("tgColumn");
            let fileToDelete = input.getAttribute("deleteFileUrl");
            let dirToDelete = input.getAttribute("deleteDirUrl");
            let sqlColumnId = input.getAttribute("sqlColumnId");
            let sqlValueId = input.getAttribute("sqlValueId");
            
            if (sqlColumnId) {
                if (sqlValueId) {
                    this.sqlColumnId = sqlColumnId
                    this.sqlValueId = sqlValueId
                }
            }
            
            if (fileToDelete) {
                if (fileToDelete[fileToDelete.length - 1] == "/") {
                    fileToDelete = fileToDelete.slice(0, -1)
                }
                this.deleteFilesUrl.push(fileToDelete)
            }
            
            if (dirToDelete) {
                if (dirToDelete[dirToDelete.length - 1] == "/") {
                    dirToDelete = dirToDelete.slice(0, -1)
                }
                this.deleteDirsUrl.push(dirToDelete)
            }
            
            if (inputAtr) {
                let inputValue = input.value;
                let curInputData
                // проверка на найстроку htmlspecialchars
                if (this.htmlspecialchars) {
                    curInputData = {column: inputAtr, value: this.convertHtmlSpecialChars(inputValue)};
                }
                else{
                    curInputData = {column: inputAtr, value: inputValue};  
                }
                // добавдяем инпут в массив с текстовыми данными формы
                this.formInputs.push(curInputData);
            }
            
            if (tgColumn) {
                let inputValue = input.value;
                let curInputData
                // проверка на найстроку htmlspecialchars
                if (this.htmlspecialchars) {
                    curInputData = {column: tgColumn, val: this.convertHtmlSpecialChars(inputValue)};
                }
                else{
                    curInputData = {column: tgColumn, val: inputValue};  
                }
                // добавдяем инпут в массив с текстовыми данными формы
                this.tgInputs.push(curInputData);
            }
        }
        
        // отправляем форму
        this.submit(this)
    }
    
    // Функция отправки данных
    submit(){
        // Создаём в массиве разделы
        if (this.sqlRequest) {
            this.sqlRequest = this.sqlRequest.toUpperCase()
        }
        
        if (this.formInputs.length > 0) {
            this.data.inputsData = this.formInputs
        }
        
        if (this.chatId && this.botToken) {
            if (this.tgInputs.length > 0) {
                this.data.tgInputs = this.tgInputs
            }
            this.data.tgConnection = {chatId: this.chatId, token: this.botToken}
        }
        
        if (this.fileInfoSend.length > 0) {
            this.data.files = this.fileInfoSend
        }
        if (this.sqlTable && this.sqlRequest) {
            this.data.db = {table: this.sqlTable, request: this.sqlRequest}
        }
        
        this.data.sql = {
            dbhost: window.EFdbhost,
            dbname: window.EFdbname,
            charset: window.EFcharset,
            login: window.EFlogin,
            pass: window.EFpass,
        }
        
        if (this.deleteFilesUrl.length > 0) {
            this.data.deleteFile = this.deleteFilesUrl
        }
        
        if (this.deleteDirsUrl.length > 0) {
            this.data.deleteDir = this.deleteDirsUrl
        }
        
        if (this.sqlRequest == "UPDATE" || this.sqlRequest == "DELETE") {
            if (this.sqlColumnId) {
                if (this.sqlValueId) {
                    this.data.id = {id: this.sqlColumnId, value:this.sqlValueId}
                }
            }
        }
        
        if (this.formInputFile) {
            let check = this.formInputFile.getAttribute("sqlColumn");
            if (check) {
                this.data.fileNameToColumn = check
            }
        }
        

        // Отправляем файлы
        let param = JSON.stringify(this.data);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${this.phpUrlFile}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(param);
        
        // Очищаем данные
        this.clearData(this);
        
        // Функция для показания отправки файла
        EFSending(this.form)
        
        // Выводим ответ Json'а
        xhr.addEventListener('readystatechange',  () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                EFSucses(this.form)
                if (this.header) {
                    window.location = this.header;
                }
                if (this.debugItem) {
                    this.debugItem.innerHTML = xhr.responseText;
                }
            }
        });
    }
    
    // Функция очистки данных
    clearData(){
        if (this.sqlRequest == 'INSERT' || this.botToken || this.chatId) {
            for (const input of this.form.children) {
                let inputAtr = input.getAttribute("sqlcolumn");
                if (inputAtr) {
                    input.value = ''
                }
            }
        }
        
        if (this.formInputFile) {
            this.formInputFile.value = ''
        }
        
        let errorLog = this.form.querySelector('.file-error');
        if (errorLog) {
            errorLog.innerHTML = ''
        }
        
        this.data = {};
        this.fileInfoSend = [];
        this.formInputs = [];
        this.tgInputs = [];
        if (this.preViewItem) {
            this.preViewItem.innerHTML = ''
        }
        
        if (this.debugItem) {
            this.debugItem.innerHTML = '';
        }
    }
}

class EasyFormSettings{
    constructor(data){
        this.phpUrlFile = data.phpUrlFile
        this.dbhost = data.dbhost
        this.dbname = data.dbname
        this.dbname = data.dbname
        this.charset = data.charset
        this.login = data.login
        this.pass = data.pass
        this.checker()
    }
    
    checker(){
        if (typeof this.phpUrlFile !== 'string' || this.phpUrlFile.trim() == '') {return false}
        if (typeof this.dbname !== 'string' || this.dbname.trim() == '') {return false}
        if (typeof this.login !== 'string') {return false}
        if (typeof this.pass !== 'string') {return false}
        if (typeof this.dbhost !== 'string' || this.dbhost == undefined || this.dbhost.trim() == '') {this.dbhost = 'localhost'}
        if (typeof this.charset !== 'string' || this.charset == undefined || this.charset.trim() == '') {this.charset = 'utf8'}
        
        this.setData()
    }
    
    setData(){
        window.EFphpUrlFile = this.phpUrlFile;
        window.EFdbname = this.dbname;
        window.EFlogin = this.login;
        window.EFpass = this.pass;
        window.EFdbhost = this.dbhost;
        window.EFcharset = this.charset;
    }
}

function EFSucses(form) {
    const body = document.querySelector('body')
    body.classList.remove('sending')
    
    body.classList.add('sucses')
    setTimeout(() => {
        body.classList.remove('sucses')
    }, 1000);
    
    console.log(form);

    console.log('SUCSEEEEEEEEEES!!!!!!!!!');
}

function EFFileLoading(form, count) {
    /*
    count - Кол-во файлов
    count == 1 - процесс загрузки
    count == 0 - конец загрузки 
    */
    const body = document.querySelector('body')
    console.log(count);

    if (count == 1) {
        body.classList.add('loading')
    }
    if (count == 0) {
        body.classList.remove('loading')
    }
}

function EFSending(form) {
    const body = document.querySelector('body')
    
    body.classList.add('sending')
}

const gs = new EasyFormSettings({
    phpUrlFile: './accets/send.php',
    dbhost: 'localhost',
    dbname: 'phpblog',
    charset: 'utf8',
    login: 'root',
    pass: '',
})

const form = new EasyForm('.form-test', {
    sqlTable: 'comments',
    sqlRequest: 'insert',
    htmlspecialchars: true,
    debugItem: '.result',
    upload: 'multy',
    uploadDir: `./upload/hjkjh/khkh/fh/`,
    // fileType: ['jpeg', 'webp', 'sql'],
    fileSize: 200,
    renameFile: true,
    preView: '.preview',
    preViewDelete: true,
    preViewDeleteInner: '5',
    // header: '/upload/asdsad.html',
});

const form2 = new EasyForm('.form-test2', {
    sqlTable: 'comments',
    sqlRequest: 'update',
    htmlspecialchars: true,
    debugItem: '.result',
    // header: '/index2.php',
});

const form3 = new EasyForm('.form-test3', {
    sqlTable: 'comments',
    sqlRequest: 'delete',
    debugItem: '.result',
    header: '/index2.php',
});

const form4 = new EasyForm('.form-test4', {
    // header: '/index2.php',
    debugItem: '.result',
});

const form5 = new EasyForm('.form-test5', {
    chatId: '-875466652',
    botToken: '5951714489:AAE_wnDy8wR836ur4h6gbSkBiHbIprXByk0',
    debugItem: '.result',
});

