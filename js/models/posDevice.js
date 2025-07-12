class posDevice{
    constructor(serialNumber, logicalNumber, reciveDate, status, changeReason, protocol, exitDate){
        this.serialNumber = serialNumber;
        this.logicalNumber = logicalNumber;
        this.reciveDate = reciveDate;
        this.status = status;
        this.changeReason = changeReason;
        this.protocol = protocol;
        this.exitDate = exitDate;
    }

    validateDatas(){
        this.status = parseInt(this.status);
        this.changeReason = parseInt(this.changeReason);
        this.protocol = parseInt(this.protocol);

        if(!this.exitDate || isNaN(new Date(this.exitDate))){
            this.exitDate = null;
        }
    
        if(!this.protocol || isNaN(this.protocol)){
            this.protocol = null;
        }
    }

    transformDatas(){
        if(this.protocol == null){
            this.protocol = "";
        };

        if(this.exitDate == null){
            this.exitDate = "";
        } else {
            const date = new Date(this.exitDate);
            if (!isNaN(date)) {
                const dia = String(date.getDate()).padStart(2, '0');
                const mes = String(date.getMonth() + 1).padStart(2, '0');
                const ano = date.getFullYear();
                this.exitDate = `${dia}/${mes}/${ano}`;
            }
        }

        if (this.reciveDate) {
            const date = new Date(this.reciveDate);
            const dia = String(date.getDate()).padStart(2, '0');
            const mes = String(date.getMonth() + 1).padStart(2, '0');
            const ano = date.getFullYear();
            this.reciveDate = `${dia}/${mes}/${ano}`;
        }
    }
}

//export const posDevice = posDevice;
module.exports = posDevice;