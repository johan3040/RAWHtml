export default class InfoBox{
    constructor(data, box, description){
        this.data = data;
        this.hiliteStart = data.hiliteStart;
        this.hiliteLength = data.hiliteLength;
        this.referenceBox = box;
        this.description = description;
        this.id = new Date().getTime();
        this.container = document.createElement("div");
        this.container.setAttribute("class", "rawValidatorInfoBox");
        this.getExtraction(data.extract);
        this.addToDom();
        this.addListeners();
    }

    getExtraction(ex){
        const header = `
            <p class="infoBoxRow">${this.description}</p>
        `;

        const content = `
            <p class="codeLine" id="${this.id}">${this.escapeChars(ex)}</p>
        `;

        this.container.innerHTML = header;
        this.container.innerHTML += content;
    }

    escapeChars(str){
        return str.replace(/<(?=\S|$)/g, "&lt;").replace(/>(?=\S|$)/g, "&gt;").replace(/\n/g,'↩').replace(/ /g, '&nbsp;');
    }

    addToDom(){
        document.body.appendChild(this.container);
        let coors = this.referenceBox.getBoundingClientRect();
        this.container.style.top = coors.top + "px";
        this.container.style.left = coors.left < 300 ? "300px" : coors.left - this.container.getBoundingClientRect().width + "px";
        this.hilite();
    }

    hilite(){
        const elem = document.getElementById(this.id);
        const str = elem.innerText;
        const firstString = str.slice(0, this.data.hiliteStart);
        const secondString = str.slice(this.data.hiliteStart, this.hiliteStart + this.data.hiliteLength);
        const thirdString = str.slice((this.data.hiliteStart + this.data.hiliteLength), str.length);
        elem.innerHTML = this.replaceChars(firstString) + "<span class='validator-hilite'>" + this.replaceChars(secondString) + "</span>" + this.replaceChars(thirdString);
    }

    replaceChars(str){
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp");
    }

    remove(){
        window.removeEventListener("resize", this.updatePosition);
        this.container.parentNode.removeChild(this.container);
    }

    addListeners(){
        window.addEventListener("resize", (e) => this.updatePosition());
    }

    updatePosition(){
        let coors = this.referenceBox.getBoundingClientRect();
        this.container.style.top = coors.top + "px";
        this.container.style.left = coors.left - this.container.getBoundingClientRect().width + "px";
    }
}