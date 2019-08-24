import InfoBox from './InfoBox.js';

export default class ListItem{
    constructor(data, domNode, id){
        this.data = data;
        this.domNode = domNode;
        this.domNodeName = domNode.nodeName;
        this.id = id;
        this.showPointerInfoBox = false;
        this.showInfoBox = false;
        this.description = '';
        this.handleGoToBoxClick = this.handleGoToBoxClick.bind(this);
        this.toggleInfoBox = this.toggleInfoBox.bind(this);
        this.getDescription();
        this.createElements();
        this.createErrorBox();
        this.createErrorMessages();
        this.addListeners();
    }

    createElements(){
        this.box = document.createElement("div");
        this.box.setAttribute("class", "listItem");
        this.title = document.createElement("h4");
        this.message = document.createElement("p");
        this.rowInfo = document.createElement("p");
        this.rowInfo.setAttribute("class", "validator__rowinfo");
        this.goToBox = document.createElement("div");
        this.goToBox.innerHTML = "&#11176;";
        this.goToBox.setAttribute("class", "goToBox");
    }

    createErrorBox(){
        let className = this.data.type == "info" ? "warning" : "error";
        this.box.classList.add(className);
    }

    createErrorMessages(){
        let text = this.data.subType ? this.data.subType : this.data.type;
        this.title.innerHTML = text;
        this.rowInfo.innerHTML = this.description;
        this.message.innerText = this.data.message.replace(/\r?\n|\r/g, "↩");
        this.box.appendChild(this.title);
        
        console.log(this.domNodeName === "SCRIPT")
        if(this.domNode !== undefined){
            console.log("Inside with type " + this.domNodeName)
            if(!this.checkIfVisibleNode()){
                this.goToBox = null;
            }else{
                this.box.appendChild(this.goToBox);
            }
        }else{
            this.goToBox = null;
        }
        this.box.appendChild(this.rowInfo);
        this.box.appendChild(this.message);
    }

    getDescription(){
        if(this.data.firstColumn){
            this.description = `From line ${this.data.firstLine ? this.data.firstLine: this.data.lastLine}, column ${this.data.firstColumn}, to line ${this.data.lastLine}, column ${this.data.lastColumn}.`;
        }else{
            this.description = `At line ${this.data.lastLine}, column ${this.data.lastColumn}.`;
        }
    }

    handleGoToBoxClick(e){
        e.stopPropagation();
        this.domNode.scrollIntoView({behavior: "smooth"});
    }

    removeGoToBox(elem){
        elem.parentNode.removeChild(elem);
    }

    toggleInfoBox(e){
        e.stopPropagation();
        if(this.showInfoBox){
            this.remove();
        }else{
            this.showInfoBox = true;
            this.infoBox = new InfoBox(this.data, this.box, this.description);
        }
    }

    remove(){
        if(this.showInfoBox){
            this.infoBox.remove();
            this.showInfoBox = false;
        }
    }

    addListeners(){
        if(this.domNode != undefined && this.checkIfVisibleNode()){
            this.goToBox.addEventListener("mouseenter", (e)=>{
                this.initialStyle = e.target.style;
                this.domNode.style.border = "3px solid red";
                this.domNode.style.boxSizing = "border-box"
            });
            this.goToBox.addEventListener("mouseleave", (e)=>{
                this.domNode.style = this.initialStyle;
            });
    
            this.goToBox.addEventListener("click", this.handleGoToBoxClick);
        }
        this.rowInfo.addEventListener("click", this.toggleInfoBox);
    }

    checkIfVisibleNode(){
        switch(this.domNodeName){
            case "SCRIPT":
                return false;
            case "HEAD":
                return false;
            case "BASE":
                return false;
            case "LINK":
                return false;
            case "META":
                return false;
            case "STYLE":
                return false;
            case "TITLE":
                return false;
            default:
                return true;
            
        }
    }
}