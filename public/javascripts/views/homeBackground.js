var backgroundModal = "#backgroundModal";
var path = '/handler/homeBackground';

var bgHome = "#backgroundHome";
var bgLive = "#backgroundLive";
var bgCommunity = "#backgroundCommunity";
var bgTvseries = "#backgroundTvSeries";
var bgYoutuber = "#backgroundYoutuber";

dbox.controller('backgroundListController', function ($scope, genericService) {
    $scope.backgrounds = null;
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
    
    // SEARCH BACKGROUNDS
    $scope.search = function (){
        
        // GET ALL DATA ON THE BASE
        genericService.handler(path, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.backgrounds = data;
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
    
    // NEW BACKGROUND
    $scope.new = function () {
        var data = { status: true };
        setBackgroundModal(data);
    };
    
    // EDIT BACKGROUND
    $scope.edit = function (data) {
        
        setBackgroundModal(data);
    };
    
    // DELETE BACKGROUND
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete background';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the background?';
        modal.invoke = 'deleteBackground';
        modal.obj = data;
        
        setMainModal(modal);
    };
    
    // OPEN UP MODAL EDITING
    var setBackgroundModal = function (data) {
        
        var s = getScope("backgroundModal");
        
        var c = angular.copy(data);
        c.status = String(c.status);

        s.background = c;
        s.old_scope = angular.copy(c);
        
        ModelPicSize();
        $(backgroundModal).modal('show');
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
        
        // DELETE BACKGROUND
        if (ac == 'deleteBackground') {
            
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

dbox.controller('backgroundModalController', function ($scope, genericService) {
    
    $scope.background = null;
    $scope.old_scope = null;
    $scope.countries = getCountries();
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.background.loader = true;
            $scope.background.save = true;
            
            $scope.background.home_file = getFileUploud(bgHome);
            $scope.background.live_file = getFileUploud(bgLive);
            $scope.background.community_file = getFileUploud(bgCommunity);
            $scope.background.tvseries_file = getFileUploud(bgTvseries);
            $scope.background.youtuber_file = getFileUploud(bgYoutuber);
            
            $scope.containsBackground (
                function(){
                    genericService.form(path, $scope.background, doneSaveBackground);
                }
            );
        }
    };
    
    // CHECK IF COUNTRY CONTAINS BACKGROUND IN THE DATABASE
    $scope.containsBackground = function (callback) {
        
        if (isNullorEmpty($scope.background.country)) {
            return false;
        }
        
        // GET NUMBER OF DATA ON THE BASE
        genericService.handler(path, { country: $scope.background.country, check: true }).
        then(function (data) {
            
            if(checkMessage(data)){
                if (JSON.stringify(data) != '[]' && data[0]._id != $scope.background._id) {
                    $scope.background.error = errorTemplate('This country already has a background added.');
                    scrollTop();
                    $scope.background.loader = null;
                }
                else{
                    callback();
                }
            }
            
        });
    };
    
    var validation = function () {
        
        var error = '';
        delete $scope.background.error;
         
        if (isNullorEmpty($scope.background.country))
            error += errorTemplate('Country');
        if (isNullorEmpty($scope.background.status))
            error += errorTemplate('Status');
            
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.background, $scope.old_scope))
            error += errorTemplate('No changes to save');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.background.error = error;
            return false;
        }
        else{
            $scope.background.error = null;
            return true;
        }
    };

});

function doneSaveBackground(data) {
    
    $(backgroundModal).modal('hide');

    var s = getScope(backgroundModal);
    s.background.loader = null;
    
    getScope("container").rSearch();
    
    resetFileUploud(bgHome);
    resetFileUploud(bgLive);
    resetFileUploud(bgCommunity);

}
