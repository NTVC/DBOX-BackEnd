var liveModal = "#liveModal";
var liveThumb = "#liveThumb";
var liveCover = "#liveCover";
var path = '/handler/live';

dbox.controller('liveListController', function ($scope, genericService) {
    $scope.lives = null;
    $scope.countries = getCountries();
    $scope.limits = getShowLimit();

    $scope.filter = {
        search: '',
        active: '1',
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
        $scope.filter.status = "";
        $scope.filter.pg.index = 0;
        $scope.search();
    };
    
    // SEARCH LIVES
    $scope.search = function (){
        
        // GET ALL DATA ON THE BASE
        genericService.handler(path, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.lives = data;
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
        filter.search = $scope.filter.search;
        filter.country = $scope.filter.country;
        filter.active = $scope.filter.active;
        
        if (isCounter) {
            filter.count = true;
        }
        else {
            filter.pg_index = $scope.filter.pg.index;
            filter.pg_limit = $scope.filter.pg.limit;
        }

        return filter;

    }
    
    // NEW LIVE
    $scope.new = function () {
        var data = { active: true };
        setLiveModal(data);
    };
    
    // EDIT LIVE
    $scope.edit = function (data) {
        
        setLiveModal(data);
    };
    
    // DELETE LIVE
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete live';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the live <b>' + data.name + '</b>?';
        modal.invoke = 'deleteLive';
        modal.obj = data;
        
        setMainModal(modal);
    };
    
    // OPEN UP MODAL EDITING
    var setLiveModal = function (data) {
        
        var s = getScope("liveModal");
        
        var c = angular.copy(data);
        c.active = String(c.active);

        s.live = c;
        s.old_scope = angular.copy(c);
        
        ModelPicSize();
        $(liveModal).modal('show');
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
        
        // DELETE LIVE
        if (ac == 'deleteLive') {
            
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

dbox.controller('liveModalController', function ($scope, genericService) {
    
    $scope.live = null;
    $scope.old_scope = null;
    $scope.countries = getCountries();
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.live.loader = true;
            $scope.live.save = true;
            $scope.live.thumb_file = getFileUploud(liveThumb);
            $scope.live.cover_file = getFileUploud(liveCover);
            
            genericService.form(path, $scope.live, doneSaveLive);
        }
    };
    
    var validation = function () {
        
        var error = '';
        delete $scope.live.error;
        
        //if (isNullorEmpty($scope.live.thumb))
        //    error += errorTemplate('Thumbnail');
        if (isNullorEmpty($scope.live.url))
            error += errorTemplate('Url');
        if (isNullorEmpty($scope.live.name))
            error += errorTemplate('Name');
        if (isNullorEmpty($scope.live.country))
            error += errorTemplate('Country');
        if (isNullorEmpty($scope.live.active))
            error += errorTemplate('Status');
            
            
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.live, $scope.old_scope) && getFileUploud(liveThumb) == "" && getFileUploud(liveCover) == "")
            error += errorTemplate('No changes to save');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.live.error = error;
            return false;
        }
        else{
            $scope.live.error = null;
            return true;
        }
    };

});

function doneSaveLive(data) {
    
    $(liveModal).modal('hide');

    var s = getScope(liveModal);
    s.live.loader = null;
    
    getScope("container").rSearch();

    resetFileUploud(liveThumb);
    resetFileUploud(liveCover);
}
