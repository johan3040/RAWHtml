
import ValidationList from './ValidationList.js';

function init(){
    window.removeEventListener("load", init);
    new Main();
}

class Main{
    constructor(){
        this.container = document.createElement("div");
        this.container.setAttribute("class", "rawHTMLContainer");
        this.container.setAttribute("draggable", "true");
        this.deltaX = null;
        this.deltaY = null;
        document.body.appendChild(this.container);
        this.loadCss();
        this.bindMethods();
        this.setInitPosition();
        this.checkBrowser();
    }

    bindMethods(){
        this.getDom =           this.getDOM.bind(this);
        this.dragStart =        this.dragStart.bind(this);
        this.dragoverBody =     this.dragoverBody.bind(this);
        this.updatePosition =   this.updatePosition.bind(this);
        this.endDrag =          this.endDrag.bind(this);
    }

    setInitPosition(){
        const position = JSON.parse(window.localStorage.getItem("htmlValidatorPosition"));
        if( position === null){
            this.setNewPosition(0, 0);
        }else{
            this.setNewPosition(position.x, position.y);
        }
    }

    loadCss(){
        var link = document.createElement( "link" );
        link.href = "ValidationStyleSheet.css";
        link.type = "text/css";
        link.rel = "stylesheet";
        document.getElementsByTagName( "head" )[0].appendChild( link );
    }

    checkIfOnline(){
       navigator.onLine ? this.createInitBox() : this.createOfflineBox();
    }

    createInitBox(){
        this.container.addEventListener("dragstart", this.dragStart);
        this.container.innerHTML = `
        <div class="rawHTMLContainer--init">
            <img src="./src/img/rawhtml_icon.png" alt="Raw Validator image" />
            <button id="rawHTMLContainer__button">Validate</button>
        </div>
        `;
        const btn = document.getElementById("rawHTMLContainer__button");
        btn.addEventListener("click", (e) => {
            console.log("click")
            this.container.innerHTML = "";
            this.getDOM();
        });
    }

    createOfflineBox(){
        this.container.innerHTML = `
        <div class="validator--center validator--lightTheme">
            <h4>You are offline</h4>
            <p>You need an internet connection to run RAWHtml validator.</p>
        </div>
        `;
    }

    checkBrowser(){
        const browser = this.getBrowser();
        const url = window.location.href;
        
        if(browser === "Chrome" && (url.indexOf("file://") !== -1 || url.indexOf("/") == 0)){
            this.container.innerHTML = `
            <div class="validator--lightTheme validator--center">
                <h4>Oops..</h4>
                <p>It seems you are using ${browser} without using a local webserver.</p><p> Need help? Go <a href="https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server"><strong>here!</strong></a></p>
            </div>
        `;
        }else{
            this.checkIfOnline();
        }
    }

    getBrowser(){
        let nAgt = navigator.userAgent;
        let browserName  = navigator.appName;
        let nameOffset,verOffset;

        // In Opera 15+, the true version is after "OPR/" 
        if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
        browserName = "Opera";
        }
        // In older Opera, the true version is after "Opera" or after "Version"
        else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
        browserName = "Opera";
        }
        // In MSIE, the true version is after "MSIE" in userAgent
        else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
        browserName = "Microsoft Internet Explorer";
        }
        // In Chrome, the true version is after "Chrome" 
        else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
        browserName = "Chrome";
        }
        // In Safari, the true version is after "Safari" or after "Version" 
        else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
        browserName = "Safari";
        }
        // In Firefox, the true version is after "Firefox" 
        else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
        browserName = "Firefox";
        }
        // In most other browsers, "name/version" is at the end of userAgent 
        else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
                (verOffset=nAgt.lastIndexOf('/')) ) 
        {
        browserName = nAgt.substring(nameOffset,verOffset);
        if (browserName.toLowerCase()==browserName.toUpperCase()) {
        browserName = navigator.appName;
        }
        }
        
        return browserName
    }

    printErrorMessage(user){
        this.container.innerHTML = `
            <div class="validator--lightTheme validator--center">
                <h4>Oops..</h4>
                <p>Could not find anyone with username ${user}</p>
            </div>
        `;
    }

    getDOM(){
        if(!window.localStorage.getItem("rawHTMLExpanded")) window.localStorage.setItem("rawHTMLExpanded", JSON.stringify({expanded: true}));
        this.container.setAttribute("id", "parentSquare");
        const loading = document.createElement("div");
        loading.setAttribute("class", "validator--loading");
        this.container.appendChild(loading);

        fetch(document.location)
        .then(res => res.text())
        .then(text => this.getFetch(text));
    }
    
    getFetch(html){
        const htmlArr = this.getLineBreak(html);
        const comments = this.getComments(htmlArr);
        let formData = new FormData();
        formData.append('out', 'json');
        formData.append('content', html);
        const opts = {
            method: "POST",
            body: formData,
            header: {
                "Content-type": "text/html; charset=utf-8"
            }
        }
        fetch("https://html5.validator.nu/", opts)
        .then(res => res.json())
        .then(res => {
                this.container.removeChild(document.getElementsByClassName("validator--loading")[0]);
                new ValidationList(res, htmlArr, comments, this.extractCoors.bind(this));  
        })
        .catch(err => console.log(err))
    }

    getLineBreak(html){
        const regex = /\r?\n|\r/g;
        let arr = html.split(regex);
        return arr;
    }

    getComments(arr){
        let comments = [];
    
        for(let i = 0; i<arr.length; i++){
            if(arr[i].indexOf("<!--") != -1){
                let comment = {startLineIndex: i, startPos: arr[i].indexOf("<!--")}
                for(let j = i; j<arr.length; j++){
                    if(arr[j].indexOf("-->") != -1){
                        comment.endLineIndex = j;
                        comment.endPos = arr[j].indexOf("-->");
                        comments.push(comment);
                        break;
                    }
                }
            }
        }
        
        return comments;
    }


    dragStart(e){
        this.emptyImage = document.createElement('img');
        this.emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        e.dataTransfer.setDragImage(this.emptyImage, 0, 0);
        e.dataTransfer.setData("text/plain", null);
        const rect = this.container.getBoundingClientRect();
        this.deltaX = e.clientX - rect.left;
        this.deltaY = e.clientY - rect.top;
        this.createDragUi();
        document.body.addEventListener("dragover", this.dragoverBody);
        this.container.addEventListener("dragend", this.endDrag);
    }

    createDragUi(){
        this.overlay = document.createElement("div");
        this.overlay.setAttribute("class","validator-dark-overlay");
        document.body.appendChild(this.overlay);
    }

    dragoverBody(e){
        this.updatePosition(e.clientX, e.clientY);
    }

    updatePosition(x, y){
        this.container.style.top = y - this.deltaY + 3 + "px";
        this.container.style.left = x - this.deltaX + "px";
    }

    endDrag(e){
        e.preventDefault();
        document.body.removeEventListener("dragover", this.dragoverBody);
        this.container.removeEventListener("dragend", this.endDrag);
        this.emptyImage = null;
        const x = parseInt(this.container.style.left);
        const endY = parseInt(this.container.style.top);
        this.extractCoors(x, endY);
        this.removeElements();
    }

    extractCoors(x, endY){
        const y = endY < 0 ? 0 : endY + this.container.clientHeight > window.innerHeight ? window.innerHeight - this.container.clientHeight : endY;
        this.setNewPosition(x, y);
    }

    removeElements(){
        document.body.removeChild(this.overlay);
    }

    /***
     * @param x int = x position of mouse coordinate
     * @param y int = y position of mouse coordinate
     */
    setNewPosition(x, y){
        this.container.style.top = y + "px";
        if(x > window.innerWidth/2){
            this.container.style.left = "";
            this.container.style.right = "0px";
        }else{
            this.container.style.right = "";
            this.container.style.left = "0px";
        }
        window.localStorage.setItem("htmlValidatorPosition", JSON.stringify({x, y}));
        //x > window.innerWidth/2 ? this.setRightPosition() : this.setLeftPosition();
    }

    setRightPosition(){
        this.container.style.left = "";
        this.container.style.right ="0px";
        window.localStorage.setItem("htmlValidatorPosition", "right");
    }

    setLeftPosition(){
        this.container.style.left = "0px";
        this.container.style.right = "";
        window.localStorage.setItem("htmlValidatorPosition", "left");
    }
}

window.addEventListener("load", init, false);