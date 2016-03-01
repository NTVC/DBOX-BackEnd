var path = '/handler/homeWidgets';

dbox.controller('widgetListController', function ($scope, genericService) {
    
    $scope.widgets = {};
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
    
    // SEARCH WIDGETS
    $scope.search = function () {
        
        $scope.widgets = null;
        // GET ALL DATA ON THE BASE
        genericService.handler(path, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.widgets = data;
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
        getScope("widgetModal").edit(data);
    };
    
    $scope.orderWidgets = function (orderArray){
        
        if (!orderArray) {
            return false;
        }
        
        genericService.handler(path, {order_widgets: true, array: orderArray}).then(function (data) {
            
            showNotification();
        });
    }
    
    // DELETE APP
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete widget';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the widget <b>' + data.name + '</b>?';
        modal.invoke = 'deleteWidget';
        modal.obj = data;
        
        setMainModal(modal);
    };

    // INIT CODE
    $scope.search();
});

dbox.controller('widgetModalController', function ($scope, genericService) {
    
    $scope.widget = { status: true };
    $scope.allowInsert = true;
    $scope.old_scope = {};
    
     $scope.getTotalActive = function(callback){
        
        genericService.handler(path, {count:true, list: true, status:true}).then(function (data) {
            if (checkMessage(data)) {
                callback(data);
            }
        });
    }
    
    // SET OR CREATE NEW OBJECT IN THE FORM
    $scope.edit = function (widget) {
        
        if (widget) {
            $scope.widget = widget;
            $scope.old_scope = angular.copy($scope.widget);
        }
        else
            $scope.widget = { status: getBool(getScope("container").filter.status), order: 999 };
            
    }
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.widget.loader = true;
            $scope.widget.save = true;
            
            if($scope.widget.status == true){
                $scope.getTotalActive( function(total){
                    
                    // DECREASES ONE BECAUSE ONE OF THEM IS THE CURRENT OBJECT
                    if($scope.widget._id){
                        total -= 1;
                    }
                    
                    if(total < limitData){
                        $scope.allowInsert = true;
                        save();
                    }
                    else{
                        $scope.allowInsert = false;
                        $scope.widget.loader = null;
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
        $scope.widget.country = getScope("container").filter.country;
        genericService.form(path, $scope.widget, doneSaveWidget);
        
    };

    var validation = function () {
        
        var error = '';
        delete $scope.widget.error;
        
        if (isNullorEmpty($scope.widget.name))
            error += errorTemplate('Name');
        if (isNullorEmpty($scope.widget.html))
            error += errorTemplate('Html');
        if (isNullorEmpty($scope.widget.status))
            error += errorTemplate('Status');
            
            
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.widget, $scope.old_scope))
            error += errorTemplate('No changes to save');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.widget.error = error;
            return false;
        }
        else{
            $scope.widget.error = null;
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
        if (ac == 'deleteWidget') {
            
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

function doneSaveWidget(data) {
    
    getScope("widgetModal").edit();
    getScope("container").search();
    
}

function sortable() {
    
    var order = '.widget-order';
    
    try { $(order).sortable("destroy"); } catch (ex) { }
    $(order).sortable({
        stop: function (event, ui) {
            getScope("container").orderWidgets(JSON.stringify($(order).sortable("toArray"))); 
        }
    });
}