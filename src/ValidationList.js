
import ListItem from './ListItem.js';

export default class ValidationList{
    constructor(data, htmlArr, comments, callback){
        this.jsonData = data;
        this.htmlArr = htmlArr;
        this.comments = comments;
        this.callback = callback;
        this.listItems = [];
        this.deltaY = null;
        this.createElements();
        this.createListItems();
        this.addListeners();
    }

    createElements(){
        this.parentSquare = document.getElementById("parentSquare");
        this.menu = document.createElement("div");
        const info = this.jsonData.messages.map(el => el.subType ? el.subType : el.type);
        const infoObj = this.numberOfErrors(info);

        const infoStr = `
            <span class="validator__warning-icon"></span>
            <span class="validator__warningText">Warnings:&nbsp;</span>
            ${infoObj.warnings}
            <span class="validator__error-icon"></span>
            <span class="validator__warningText">&nbsp;Errors:&nbsp;</span>
            ${infoObj.errors}
            <span class="validator__smallIcon"></span>
            `;

        this.menu.innerHTML = infoStr;
        this.menu.setAttribute("id", "validationListMenuBar");
        this.menuContent = document.createElement("span");
        this.menuContent.setAttribute("class", "extendedBtn extended");
        this.menuContent.innerHTML = "&#171;";
        this.menu.appendChild(this.menuContent);
        this.listContainer = document.createElement("div");
        this.listContainer.setAttribute("class", "validatorListContainer validatorListContainer--expanded");
        this.parentSquare.appendChild(this.menu);
        this.parentSquare.appendChild(this.listContainer);
        document.body.appendChild(this.parentSquare);
        this.checkIfExpanded();
    }

    checkIfExpanded(){
        const expanded = JSON.parse(window.localStorage.getItem("rawHTMLExpanded")).expanded;
        if(!expanded) this.toggleExpansion();
    }

    numberOfErrors(arr){
        let obj = {
            warnings: 0,
            errors: 0
        }
        arr.map(el => el === "warning" ? obj.warnings++ : obj.errors++);
        return obj;
    }

    createListItems(){
        const lineb = /\r?\n|\r/g;
        for(let i = 0; i<this.jsonData.messages.length; i++){
            let item = this.jsonData.messages[i];
            let index = item.lastLine-1;
            let str = this.htmlArr[index].split("↵")[0];//.trim();
            let position = item.firstColumn;
            let extractArr = item.extract.split(lineb);
            
            //extractArr.length === 1 ? this.inspectElem(str, extractArr[0], item) : this.inspectElem(str, extractArr[1], item);

            let domNode = this.getElem(position, index);
            let listItem = new ListItem(item, domNode, i);
            this.listItems.push(listItem);
            this.listContainer.appendChild(listItem.box);
        }
    }

    /**
     * Retrieves the specific DOM-element
     * @param {int} pos 
     * @param {int} index 
     */
    getElem(pos, index){
        
        const originalString = this.htmlArr[index];

        // Hela strängen från given startposition
        const sub = originalString.substring(pos, originalString.length);
        
        //Elementets tagg
        const el = sub.substring(0, sub.indexOf(">"));

        //Vid exempelvis bilder, där ">" inte följer direkt efter elementet - splitta vid " " och använd index 0.
        const final = el.split(" ")[0];
        
        // Hela strängen fram till index (pos)
        const beforeString = originalString.substring(0, pos);

        let occurances = this.findOccurances(final.toLowerCase(), beforeString, index);

        for(let i = index-1; i>=0; i--){
            let s = this.htmlArr[i];
            occurances += this.findOccurances(final.toLowerCase(), s, i);
        }

        return document.getElementsByTagName(final)[occurances];
    }


    /**
     * Will loop trough entire given string to find occurances of the same element
     * @param {string} el 
     * @param {string} string 
     * @param {int} index 
     */
    findOccurances(el, string, index){
        const elem = `<${el}>`;
        let result = 0;
        for (let i = 0; i < string.length; i++) {
            let sub = string.substring(i, i + elem.length).toLowerCase()
            if (sub == elem && !this.betweenComments(i, index)) {
                result++;
            }
        }
        return result;
    }

    /**
     * Check if element is between comments
     * stringPos = start position in string
     * arrayIndex = array index... duh
     * @param {int} stringPos 
     * @param {int} arrayIndex 
     */
    betweenComments(stringPos, arrayIndex){
        
        let betweenComments = false;
        this.comments.map(comment => {
            if( arrayIndex >= comment.startLineIndex && 
                arrayIndex <= comment.endLineIndex &&
                stringPos >= comment.startPos &&
                stringPos <= comment.endPos)
                {
                    betweenComments = true;
                }
        });
        return betweenComments;
    }

    addListeners(){
        this.parentSquare.addEventListener("scroll", (e)=> this.listItems.map(el => el.remove()));
        
        this.menu.addEventListener("click", (e) => {
            this.toggleExpansion();
        })
    }

    toggleExpansion(){
        this.changeClassNames();
        this.listItems.map(item => item.remove());
        const expanded = this.listContainer.classList.contains("validatorListContainer--expanded");
        const { x, y } = this.parentSquare.getBoundingClientRect();
        window.localStorage.setItem("rawHTMLExpanded", JSON.stringify({expanded: expanded}));

        if(expanded){
            this.deltaY = y;
            this.callback(x, y);
        }else{
            this.callback(x, this.deltaY);
        }
    }

    changeClassNames(){
        this.parentSquare.classList.toggle("validator--disable-scroll");
        this.listContainer.classList.toggle("validatorListContainer--expanded");
        this.menuContent.classList.toggle("extended");
        document.getElementsByClassName("validator__warning-icon")[0].classList.toggle("validator__inline-block");
        document.getElementsByClassName("validator__error-icon")[0].classList.toggle("validator__inline-block");
        document.getElementsByClassName("validator__warningText")[0].classList.toggle("validator__warning--hide");
        document.getElementsByClassName("validator__warningText")[1].classList.toggle("validator__warning--hide");
        document.getElementsByClassName("validator__smallIcon")[0].classList.toggle("validator__inline-block");
    }

}