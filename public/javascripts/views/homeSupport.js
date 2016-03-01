var supportModal = "#supportModal";
var path = '/handler/homeSupport';

dbox.controller('supportListController', function ($scope, genericService) {
    $scope.supports = null;
    $scope.countries = getCountries();
    $scope.limits = getShowLimit();

    $scope.filter = {
        search: '',
        status: '1',
        country: '',
        pg: {
            index: 0, 
            limit: '25',
            range: 0,
            total: 0
        }
    }
    
    // RESET SEARCH FILTER
    $scope.rSearch = function () {
        
        $scope.filter.search = "";
        $scope.filter.pg.index = 0;
        $scope.search();
    };
    
    // SEARCH SUPPORTS
    $scope.search = function (){
        
        // GET ALL DATA ON THE BASE
        genericService.handler(path, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.supports = data;
                addCountryJs();
            }
        });

        // GET NUMBER OF DATA ON THE BASE
        genericService.handler(path, getFilter(true)).then(function (data) {
            
            $scope.filter.pg.total = data;
            $scope.filter.pg = preparePagination($scope.filter.pg);
        });
    };
    
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        
        filter.list = true;
        //filter.search = $scope.filter.search;
        filter.country = $scope.filter.country;
        filter.status = $scope.filter.status;
        
        if (isCounter) {
            filter.count = true;
        }
        else {
            filter.pg_index = $scope.filter.pg.index;
            filter.pg_limit = $scope.filter.pg.limit;
        }

        return filter;

    }
    
    // NEW SUPPORT
    $scope.new = function () {
        var data = { status: true };
        setSupportModal(data);
    };
    
    // EDIT SUPPORT
    $scope.edit = function (data) {
        
        setSupportModal(data);
    };
    
    // DELETE SUPPORT
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete support';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the support <b>' + data.name + '</b>?';
        modal.invoke = 'deleteSupport';
        modal.obj = data;
        
        setMainModal(modal);
    };
    
    // OPEN UP MODAL EDITING
    var setSupportModal = function (data) {
        
        var s = getScope("supportModal");
        
        var c = angular.copy(data);
        c.status = String(c.status);

        s.support = c;
        s.old_scope = angular.copy(c);
        
        ModelPicSize();
        $(supportModal).modal('show');
    };
    
    $scope.search();
});

dbox.controller('genericModal', function ($scope, genericService) {
    
    /*##############################################################*/
    //MODALS
    $scope.modal = {};
    
    $scope.modalAction = function (ac) {
        
        var keywords = null;
        $scope.modal.loader = 1;
        
        // DELETE SUPPORT
        if (ac == 'deleteSupport') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            
            genericService.handler(path, keywords).then(function (response) {
                if (checkMessage(response)) {
                    
                    modelAlertClose();
                    
                    getScope("container").rSearch();
                    $scope.modal = null;
                }
            });
        }
    };

});

dbox.controller('supportModalController', function ($scope, genericService) {
    
    $scope.support = null;
    $scope.old_scope = null;
    $scope.countries = getCountries();
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.support.loader = true;
            $scope.support.save = true;
            
            $scope.containsSupport (
                function(){
                    genericService.form(path, $scope.support, doneSaveSupport);
                }
            );
        }
    };
    
    // CHECK IF COUNTRY CONTAINS SUPPORT IN THE DATABASE
    $scope.containsSupport = function (callback) {
        
        if (isNullorEmpty($scope.support.country)) {
            return false;
        }
        
        // GET NUMBER OF DATA ON THE BASE
        genericService.handler(path, { country: $scope.support.country, check: true }).
        then(function (data) {
            
            if(checkMessage(data)){
                if (JSON.stringify(data) != '[]' && data[0]._id != $scope.support._id) {
                    $scope.support.error = errorTemplate('This country already has a support added.');
                    scrollTop();
                    $scope.support.loader = null;
                }
                else{
                    callback();
                }
            }
            
        });
    };
    
    var validation = function () {
        
        var error = '';
        delete $scope.support.error;
        
        if (isNullorEmpty($scope.support.title))
            error += errorTemplate('Title');
            
        if (!isNullorEmpty($scope.support.email)){
            
            if(!validateEmail($scope.support.email))
                error += errorTemplate('E-mail');
        }
            
        if (isNullorEmpty($scope.support.country))
            error += errorTemplate('Country');
        if (isNullorEmpty($scope.support.status))
            error += errorTemplate('Status');
            
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.support, $scope.old_scope))
            error += errorTemplate('No changes to save');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.support.error = error;
            return false;
        }
        else{
            $scope.support.error = null;
            return true;
        }
    };

});

function doneSaveSupport(data) {
    
    $(supportModal).modal('hide');

    var s = getScope(supportModal);
    s.support.loader = null;
    
    getScope("container").rSearch();

}
