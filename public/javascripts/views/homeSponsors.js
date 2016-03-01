var sponsorPoster = "#sponsorPoster";
var path = '/handler/homeSponsors';

dbox.controller('sponsorListController', function ($scope, genericService) {
    
    $scope.sponsors = {};
    $scope.countries = getCountries();

    $scope.filter = {
        search: '',
        status: '1',
        country: 'CA',
        pg: {
            index: 0, 
            limit: '25',
            range: 0,
            total: 0
        }
    }
    
    // SEARCH SPONSORS
    $scope.search = function () {
        
        $scope.sponsors = null;
        // GET ALL DATA ON THE BASE
        genericService.handler(path, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.sponsors = data;
                setTimeout(function () { sortable(); }, 1000);
            }
        });
        
    };
    
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        filter.list = true;
        filter.search = $scope.filter.search;
        filter.status = $scope.filter.status;
        filter.country = $scope.filter.country;
        
        if (isCounter) {
            filter.count = true;
        }
        else {
            filter.pg_index = $scope.filter.pg.index;
            filter.pg_limit = $scope.filter.pg.limit;
        }
        
        return filter;

    }
    
    $scope.edit = function (data) {
        getScope("sponsorModal").edit(data);
    };
    
    $scope.orderSponsors = function (orderArray){
        
        if (!orderArray) {
            return false;
        }
        
        genericService.handler(path, {order_sponsors: true, array: orderArray}).then(function (data) {
            
            showNotification();
        });
    }
    
    // DELETE APP
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete sponsor';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the sponsor <b>' + data.name + '</b>?';
        modal.invoke = 'deleteSponsor';
        modal.obj = data;
        
        setMainModal(modal);
    };

    // INIT CODE
    $scope.search();
});

dbox.controller('sponsorModalController', function ($scope, genericService) {
    
    $scope.sponsor = { status: true };
    $scope.allowInsert = true;
    $scope.old_scope = {};
    
    $scope.getTotalActive = function(callback){
        
        genericService.handler(path, {count:true, list: true, status:true}).then(function (data) {
            if (checkMessage(data)) {
                callback(data);
            }
        });
    }
    
    $scope.edit = function (data){
        
        if(data){
            $scope.sponsor = data;
        }
        else{
            $scope.sponsor = { status: getBool(getScope("#container").filter.status) };
        }
    
        ModelPicSize();
        $scope.old_scope = angular.copy($scope.sponsor);
    }

    // SECOND VALIDATION BEFORE SAVE
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.sponsor.loader = true;
            $scope.sponsor.save = true;
            
            if($scope.sponsor.status == true){
                $scope.getTotalActive( function(total){
                    
                    // DECREASES ONE BECAUSE ONE OF THEM IS THE CURRENT OBJECT
                    if($scope.sponsor._id){
                        total -= 1;
                    }
                    
                    if(total < limitData){
                        $scope.allowInsert = true;
                        save();
                    }
                    else{
                        $scope.allowInsert = false;
                        $scope.sponsor.loader = null;
                    }
                    
                });
            }
            else{
                save();
            }
        }
    };
    
    var save = function(){
        
        // ADD COUNTRY
        $scope.sponsor.country = getScope("container").filter.country;
        // ADD THUMBNAIL
        $scope.sponsor.poster_file = getFileUploud(sponsorPoster);
        genericService.form(path, $scope.sponsor, doneSaveSponsor);
        
    };

    var validation = function () {
        
        var error = '';
        delete $scope.sponsor.error;
        
        if (isNullorEmpty($scope.sponsor.name))
            error += errorTemplate('Name');
        if (isNullorEmpty($scope.sponsor.url))
            error += errorTemplate('Url');
        if (isNullorEmpty($scope.sponsor.status))
            error += errorTemplate('Status');
            
            
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.sponsor, $scope.old_scope) && getFileUploud(sponsorPoster) == "")
            error += errorTemplate('No changes to save');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.sponsor.error = error;
            return false;
        }
        else{
            $scope.sponsor.error = null;
            return true;
        }
    };
});

dbox.controller('genericModal', function ($scope, genericService) {
    
    /*##############################################################*/
    //MODALS
    $scope.modal = {};
    
    $scope.modalAction = function (ac) {
        
        var keywords = null;
        $scope.modal.loader = 1;
        
        // DELETE APP
        if (ac == 'deleteSponsor') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            
            genericService.handler(path, keywords).then(function (response) {
                if (checkMessage(response)) {
                    
                    modelAlertClose();
                    
                    getScope("container").search();
                    $scope.modal = null;
                }
            });
        }
    };

});

function doneSaveSponsor(data) {
    
    getScope("sponsorModal").edit();
    getScope("container").search();
    
    setTimeout(function(){ ModelPicSize(); }, 500);
    
    resetFileUploud(sponsorPoster);
}

function sortable() {
    
    var order = '.sponsor-order';
    
    try { $(order).sortable("destroy"); } catch (ex) { }
    $(order).sortable({
        stop: function (event, ui) {
            getScope("container").orderSponsors(JSON.stringify($(order).sortable("toArray"))); 
        }
    });
}