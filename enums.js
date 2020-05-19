(function(Grainger){
    "use strict";
    if(typeof Grainger !== 'object'){
        Grainger = {};
    }
    
    if(typeof Grainger.enums !== 'object'){
        Grainger.enums = {};
    }
    
    var OnlineAvailabilityStatusCode = {
        isApproved : function (status) {
            return (status === 'GENERALSALE' || status === 'LIMITEDSALE' || 
                status === 'DISCONTINUEDDISPLAY' || status === 'PURCHASEONLY' || status === 'RESTRICTEDSALE' );
        },        
        isDiscontinuedDisplay : function (status) {
            return status === 'DISCONTINUEDDISPLAY';
        }
    };
    
    /*
     * This is a client-side implementation of the SalesStatus enum. When JSON-encoded,
     * the SalesStatus enum is converted to a string value. This value can be passed into
     * the boolean helper methods in this implementation. If you find a method you need
     * is missing, please add it.
     */
    var SalesStatus = {
        isClearance : function (status) { 
            return (status == 'WG' || status == 'WV' || status == 'XG'); 
        },
        isDiscontinued : function (status) { 
            return (status == 'XP' || status == 'XF' || status == 'DG' || status == 'DV');
        },
        isThirdParty : function (status) {
            return status == 'TP';
        },
        isThirdPartyOrNonStocked : function (status) {
            return status == 'TP' || status == 'NS';
        },
        isReadyToShip : function (status) {
            return !(status == 'NS' || status == 'TP' || status == 'WG' || status == 'WV' || 
                    status == 'XP' || status == 'XF' || status == 'XG' || status == 'DG' || status == 'DV');

        },
        isLimitedSupply : function (status, distributionNotesFlag) {
            return (distributionNotesFlag && status != 'DG' && status != 'DV' && status != 'TP');
        }
    };
    
    Grainger.enums.SalesStatus = SalesStatus;
    Grainger.enums.OnlineAvailabilityStatusCode = OnlineAvailabilityStatusCode;
})(Grainger);