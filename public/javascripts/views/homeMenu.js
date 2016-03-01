var path = '/handler/homeMenu';

dbox.controller('menuListController', function ($scope, genericService) {
    
    $scope.menus = {};
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
        
        $scope.menus = null;
        // GET ALL DATA ON THE BASE
        genericService.handler(path, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.menus = data;
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
        getScope("menuModal").edit(data);
    };
    
    $scope.orderMenus = function (orderArray){
        
        if (!orderArray) {
            return false;
        }
        
        genericService.handler(path, {order_menus: true, array: orderArray}).then(function (data) {
            showNotification();
        });
    }
    
    // DELETE APP
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete menu';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the menu <b>' + data.title + '</b>?';
        modal.invoke = 'deleteMenu';
        modal.obj = data;
        
        setMainModal(modal);
    };

    // INIT CODE
    $scope.search();
});

dbox.controller('menuModalController', function ($scope, genericService) {
    
    $scope.menu = { status: true };
    $scope.allowInsert = true;
    $scope.old_scope = {};
    $scope.urls = null;
    
    $scope.setUrls = function () {
        
        genericService.json('homescreen/menu.nexturl.json').then(function (data) {
            $scope.urls = data;
        });
    };
    
    $scope.setSubmenu = function(){
       $scope.menu.submenu = getBoolean($('option:selected', "#nexturl").attr('data-submenu'));
    };
    
    $scope.getTotalActive = function(callback){
        
        genericService.handler(path, {count:true, list: true, status:true}).then(function (data) {
            if (checkMessage(data)) {
                callback(data);
            }
        });
    }
    
    $scope.edit = function (data){
        
        if(data){
            $scope.menu = data;
        }
        else{
            $scope.menu = { status: getBool(getScope("#container").filter.status) };
        }
    
        ModelPicSize();
        $scope.old_scope = angular.copy($scope.menu);
    }

    $scope.save = function () {
        
        if (validation()) {
            
            $scope.menu.loader = true;
            $scope.menu.save = true;
            
            if($scope.menu.status == true){
                $scope.getTotalActive( function(total){
                    
                    // DECREASES ONE BECAUSE ONE OF THEM IS THE CURRENT OBJECT
                    if($scope.menu._id){
                        total -= 1;
                    }
                    
                    if(total < limitData){
                        $scope.allowInsert = true;
                        save();
                    }
                    else{
                        $scope.allowInsert = false;
                        $scope.menu.loader = null;
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
        $scope.menu.country = getScope("container").filter.country;
        genericService.form(path, $scope.menu, doneSaveMenu);
        
    };

    var validation = function () {
        
        var error = '';
        delete $scope.menu.error;
        
        if (isNullorEmpty($scope.menu.title))
            error += errorTemplate('Title');
        if (isNullorEmpty($scope.menu.nexturl))
            error += errorTemplate('Next url');
        if (isNullorEmpty($scope.menu.status))
            error += errorTemplate('Status');
            
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.menu, $scope.old_scope))
            error += errorTemplate('No changes to save');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.menu.error = error;
            return false;
        }
        else{
            $scope.menu.error = null;
            return true;
        }
    };
    
    $scope.setUrls();
});

dbox.controller('genericModal', function ($scope, genericService) {
    
    /*##############################################################*/
    //MODALS
    $scope.modal = {};
    
    $scope.modalAction = function (ac) {
        
        var keywords = null;
        $scope.modal.loader = 1;
        
        // DELETE APP
        if (ac == 'deleteMenu') {
            
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

function doneSaveMenu(data) {
    
    getScope("menuModal").edit();
    getScope("container").search();
    
    setTimeout(function(){ ModelPicSize(); }, 500);
}

function sortable() {
    
    var order = '.menu-order';
    
    try { $(order).sortable("destroy"); } catch (ex) { }
    $(order).sortable({
        stop: function (event, ui) {
            getScope("container").orderMenus(JSON.stringify($(order).sortable("toArray"))); 
        }
    });
}