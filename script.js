class EasyForm {
    constructor(selector, infoObj){
        this.form        = document.querySelector(selector);
        if (!this.form) {
            return false;
        }
        this.sqlTable    = infoObj.sqlTable         === undefined ? false : infoObj.sqlTable;
        this.sqlRequest  = infoObj.sqlRequest       === undefined ? false : infoObj.sqlRequest;
        this.htmlSpChars = infoObj.htmlspecialchars === undefined ? false : infoObj.htmlspecialchars;
        this.debugItem   = infoObj.debugItem        === undefined ? false : infoObj.debugItem;
        this.phpUrlFile  = infoObj.phpUrlFile       === undefined ? false : infoObj.phpUrlFile;
        this.uploadFile  = infoObj.uploadFile       === undefined ? false : infoObj.uploadFile;
        this.filePath    = infoObj.filePath         === undefined ? false : infoObj.filePath;
        this.fyleType    = infoObj.fyleType         === undefined ? false : infoObj.fyleType;
        this.fileSize    = infoObj.fileSize         === undefined ? false : infoObj.fileSize;
        this.preView     = infoObj.preView          === undefined ? false : infoObj.preView;
        this.renameFile  = infoObj.renameFile       === undefined ? false : infoObj.renameFile;
        this.formUpdate  = false;
        this.fileInfo  = '';
        this.sqlData     = {table: `${this.sqlTable}`, request: `${this.sqlRequest}`.toUpperCase()};
        this.data        = [];
        this.debugCheck  = {
            formSelector: selector,
            sqlTable: this.sqlTable,
            sqlRequest: this.sqlRequest,
            phpUrlFile: this.phpUrlFile,
        }
        this.listeners();
    }
    
    listeners(){
        this.formType(this);
        for (const key in this.debugCheck) {
            if (!this.debugCheck[key] && !this.uploadFile) {
                this.error(key, this.debugCheck.formSelector);
            }
        }
        this.form.addEventListener('submit', this.submit.bind(this));
    }
    
    // Check form type
    formType(){
        
        if(this.uploadFile && this.filePath && this.sqlRequest){
            //form with fileLoad and text
            console.log("multiFile+text");
        }
        
        else if(this.uploadFile && this.filePath && !this.sqlRequest){
            //form with fileLoad only
            console.log("multiFile");
            if (this.preView) {
                let formInputFile = this.form.querySelector('input[type="file"]');
                formInputFile.addEventListener("change", this.fileCheck.bind(this));
                this.form.addEventListener("submit", this.fileSend.bind(this));
            }
            else{
                this.form.addEventListener('submit', this.fileCheck.bind(this));
            }
        }
        
        else if (!this.uploadFile  && this.sqlRequest) {
            //form with textLoad only
            console.log('just text');
            this.form.addEventListener('submit', this.submit.bind(this));
        }
        
    }
    
    error(key, formSelector){
        if (this.debugItem) {
            document.querySelector(this.debugItem).innerHTML += `Not found KEY or VALUE of <b> "${key}" FORM "${formSelector}"</b><br>`;
        }
        console.log(`Not found KEY or VALUE ${key} FORM ${formSelector}`);
        return false;
    }
    
    fileCheck(e){
        e.preventDefault();
        let formInputFile = this.form.querySelector('input[type="file"]');
        let formFile = formInputFile.files[0];
        let errorLog = this.form.querySelector('.error');
        let preView = this.form.querySelector(this.preView);
        
        if (!errorLog) {
            let error = document.createElement('div');
            error.classList.add('error');
            this.form.appendChild(error)
        }
        errorLog = this.form.querySelector('.error');
        
        function fileMime(name) {
            return name.match(/\.([^.]+)$|$/)[1]
        }

        
        if (formFile.size > this.fileSize * 1024 * 1024) {
            errorLog.innerHTML = 'Этот файл слишком большой!';
            preView.innerHTML = '';
            formInputFile.value = '';
            preView.innerHTML = ''
            
            console.log('Большой размер файла');
            
            return false;
        }
        
        if (!this.fyleType.includes(fileMime(formFile.name))) {
            errorLog.innerHTML = 'Недопустимый формат файла!';
            preView.innerHTML = '';
            formInputFile.value = '';
            preView.innerHTML = ''

            console.log('Недопустимый формат файла!');
            
            return false;
        }
        
        if (this.preView) {
            this.preViewfn(formFile);
        }
    }
    
    preViewfn(file){
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('load', (e)=>{
            this.fileInfo = {
                uploadSrc: e.target.result, 
                fileName: file.name,
                uploadDir: this.filePath,
                rename: this.renameFile
            };
            console.log(this.fileInfo);
            this.form.querySelector(this.preView).innerHTML = `<img src="${e.target.result}" alt="preview" class="preview__img">`;
        })
        reader.addEventListener('error', (e)=>{
            this.form.querySelector(this.preView).innerHTML = `Ошибка при загрузке( Попробуйте снова`;
        })
        let errorLog = this.form.querySelector('.error');
        errorLog.innerHTML = ''
    }
    
    fileSend(e){
        e.preventDefault();
        let formInputFile = this.form.querySelector('input[type="file"]');
        let inputAtr = formInputFile.getAttribute('sqlColumn');
        
        // async function send(formFile, info) {

        //     let response = await fetch(info.phpUrlFile, {
        //         method: 'POST',
        //         body: formFile,
        //     });
        //     if (response.ok) {
        //         console.log('Всё ок');
        //     }
        //     else{
        //         console.log('Не так уж(');
        //     }
        // }
        // send(formFile, this);
        
        let parametr = JSON.stringify(this.fileInfo);
        // let parametr = this.imgSrc;
        
        let xhr2 = new XMLHttpRequest();
        xhr2.open('POST', `${this.phpUrlFile}`, true);
        xhr2.setRequestHeader("Content-Type", "application/json");
        xhr2.send(parametr);

        xhr2.addEventListener('readystatechange',  () => {
            if (xhr2.readyState === 4 && xhr2.status === 200) {
                if (this.debugItem) {
                    document.querySelector(this.debugItem).innerHTML = xhr2.responseText;
                }
            }
        });
        
        this.form.querySelector(this.preView).innerHTML = '';
    }
    
    
    submit(e){

        e.preventDefault();
        this.formInputs = this.form.children;
        
        function convertHtmlCharts(text) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }
        
        for (let i = 0; i < this.formInputs.length; i++) {
            let curInput = this.formInputs[i];
            let columnId = curInput.getAttribute("sqlColumnId");
            if(columnId){
                this.formUpdate = columnId;
            }
        }
        
        for (let i = 0; i < this.formInputs.length; i++) {
            let curInput = this.formInputs[i];
            let columnName = curInput.getAttribute("sqlColumn");
            
            if (columnName) {
                let inputValue = curInput.value;

                if (this.htmlSpChars) {
                    var curInputData = {column: columnName, value: convertHtmlCharts(inputValue)};
                }
                else{
                    var curInputData = {column: columnName, value: inputValue};  
                }
                this.data.push(curInputData);
            }
            
            if (!this.formUpdate) {
                curInput.value= "";
            }


        }
        this.data.push(this.sqlData);
        
        let param = JSON.stringify(this.data);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${this.phpUrlFile}?id=${this.formUpdate}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(param);
        this.data = [];

        xhr.addEventListener('readystatechange',  () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (this.debugItem) {
                    document.querySelector(this.debugItem).innerHTML = xhr.responseText;
                }
            }
        });
    }
}

const player = new EasyForm('.form-test', {
    sqlTable: 'comments',
    sqlRequest: 'insert',
    htmlspecialchars: true,
    phpUrlFile: './test.php',
    debugItem: '.result',
});

const player2 = new EasyForm('.form-test2', {
    sqlTable: 'comments',
    sqlRequest: 'insert',
    // htmlspecialchars: true,
    phpUrlFile: './test.php',
    debugItem: '.result',
});

const player3 = new EasyForm('.form-test3', {
    sqlTable: 'comments',
    sqlRequest: 'update',
    htmlspecialchars: true,
    phpUrlFile: './test.php',
    debugItem: '.result',
});

const player4 = new EasyForm('.form-test4', {
    phpUrlFile: './test.php',
    debugItem: '.result',
    uploadFile: true,
    fyleType: ['jpeg', 'jpg', 'png', 'pdf', 'webp', 'docx'],
    filePath: './upload/',
    fileSize: 20, //size in MB
    preView: '.preview',
    renameFile: true,
});
