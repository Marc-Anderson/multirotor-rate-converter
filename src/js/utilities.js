String.prototype.toSentenceCase = function(){
    return `${this.split("",1)[0]}${this.substring(1).toLowerCase()}`
}