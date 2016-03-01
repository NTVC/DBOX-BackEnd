var appThumb = "#appThumb";
var path = '/handler/homeApps';

/*##############################################################*/
// MAIN CONTAINER CONTROLLER
dbox.controller('appListController', function ($scope, genericService) {

    $scope.apps = {};
    $scope.countries = getCountries();
    
    // MASTER FILTER
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
    
    // SEARCH APPS
    $scope.search = function () {
        
        $scope.apps = null;
        genericService.handler(path, getFilter(false)).then(function (data) {
            
            if (checkMessage(data)) {
                $scope.apps = data;
                
                setTimeout(function () { 
                    sortable();
                 }, 1000);
            }

        });
        
    };
    
    // GET CURRENT FILTER
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
    
    // BIND FORM TO EDIT OBJECT
    $scope.edit = function (data) {
        getScope("appModal").edit(data);
    };
    
    // APPS'S ORDINATION 
    $scope.orderApps = function (orderArray){
        
        if (!orderArray) {
            return false;
        }
        
        genericService.handler(path, {order_apps: true, array: orderArray}).then(function (data) {
            showNotification();
        });
    }
    
    // DELETE APP
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete app';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the app <b>' + data.name + '</b>?';
        modal.invoke = 'deleteApp';
        modal.obj = data;
        
        setMainModal(modal);
    };

    // INIT CODE
    $scope.search();
});

/*##############################################################*/
// ADD AND EDIT NEW OBJECTS
dbox.controller('appModalController', function ($scope, genericService) {
    
    $scope.allowInsert = true;
    $scope.app = { status: true };
    $scope.old_scope = {};
    
    // SET OR CREATE NEW OBJECT IN THE FORM
    $scope.edit = function (app) {
        
        if (app) {
            $scope.app = app;
            $scope.old_scope = angular.copy($scope.app);
        }
        else
            $scope.app = { status: getBool(getScope("container").filter.status), order: null};
            
        // SET IMAGE SIZE
        setTimeout(function () { ModelPicSize(); }, 200);
    }

    // SAVE OBJECT
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.app.loader = true;
            $scope.app.save = true;
            
            save();
        }
    };
    
    var save = function(){
        
        // ADD THUMBNAIL
        $scope.app.thumb_file = getFileUploud(appThumb);
        
        if($scope.app.order == null){
            $scope.app.order = getScope("container").apps.length + 1;
        }
        
        genericService.form(path, $scope.app, doneSaveApp);
        
    };

    // VALIDATE BASIC FIELDS TO THE OBJECT
    var validation = function () {
        
        var error = '';
        delete $scope.app.error;
        
        if (isNullorEmpty($scope.app.thumb))
            error += errorTemplate('Thumbnail');
        if (isNullorEmpty($scope.app.name))
            error += errorTemplate('Name');
        if (isNullorEmpty($scope.app.key))
            error += errorTemplate('Key');
        if (isNullorEmpty($scope.app.status))
            error += errorTemplate('Status');
            
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.app, $scope.old_scope) && getFileUploud(appThumb) == "")
            error += errorTemplate('No changes to save');
            
        if ($.trim(error) != "") {
            scrollTop();
            $scope.app.error = error;
            return false;
        }
        else {
            $scope.app.error = null;
            return true;
        }
    };
});

/*##############################################################*/
//MODALS
dbox.controller('genericModal', function ($scope, genericService) {
    
    $scope.modal = {};
    
    $scope.modalAction = function (ac) {
        
        // BASIC SETTINGS FOR ALL MODALS AND ACTIONS
        
        var keywords = null;
        $scope.modal.loader = 1;
        
        // END  BASIC SETTINGS
        
        // DELETE APP
        if (ac == 'deleteApp') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            
            genericService.handler(path, keywords).then(function (response) {
                if (checkMessage(response)) {
                    
                    modelAlertClose();
                    
                    var s = getScope("container");
                    
                    // REMOVE CURRENT OBJECT FROM THE SCREEN
                    var index = s.apps.indexOf($scope.modal.obj);
                    s.apps.splice(index, 1);
                    
                    // RESET MODAL
                    $scope.modal = null;
                }
            });
        }
    };

});

/*##############################################################*/
// BIND CONTAINER WITH THE NEW OBJECT INCLUDE
function doneSaveApp(data) {
    
    getScope("appModal").edit();
    getScope("container").search();
    
    resetFileUploud(appThumb);
}

/*##############################################################*/
// CONTENT'S ORDINATION 
function sortable() {
    
    var order = '.app-order';
    
    try { $(order).sortable("destroy"); } catch (ex) { }
    $(order).sortable({
        stop: function (event, ui) {
            getScope("container").orderApps(JSON.stringify($(order).sortable("toArray"))); 
        }
    });
}