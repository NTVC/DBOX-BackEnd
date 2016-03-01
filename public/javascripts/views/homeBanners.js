var path = '/handler/homeBanners';
var pathContent = '/handler/homeBannersContent';
var addListModal = "#addListModal";
var addContentModal = "#addContentModal";

var contentBanner = "#contentBanner";

/*##############################################################*/
// MAIN CONTAINER CONTROLLER
dbox.controller('homeBannersController', function ($scope, genericService) {
    
    $scope.banners = null;
    $scope.countries = getCountries();
    
    // BASIC FILTER
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
    
    // GET BANNERS
    $scope.loadAll = function (){
        
        $scope.banners = null;
        genericService.handler(path, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                
                $scope.banners = data;
                
                for(i in $scope.banners){
                    $scope.banners[i].list = [];
                    
                    getContent($scope.banners[i]);
                }
                
                setTimeout(function () {
                    sortableBanner();
                    ModelPicSize();
                }, 1000);
            }
        });
    }
    
    
    // BANNER'S ORDINATION 
    $scope.orderBanners = function (orderArray) {
        
        if (!orderArray) {
            return false;
        }
        
        genericService.handler(path, { order_banners: true, array: orderArray }).then(function (data) {
            
            showNotification();
        });
    }
    
    // EDIT BANNER AREA
    $scope.edit = function(data){
        getScope(addListModal).edit(data);
    };
    
    // DELETE BANNER AREA
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete banner';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the banner <b>' + data.title + '</b>?';
        modal.invoke = 'deleteBanner';
        modal.obj = data;
        
        setMainModal(modal);
    };
    
    // GET FILTER
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
    /*##############################################################*/
    // CONTENT FUNCTIONS

    
    // DELETE CONTENT
    $scope.delete_content = function (content) {
        
        var modal = {};
        
        modal.title = 'Delete Content';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove this content?';
        modal.invoke = 'deleteContent';
        
        modal.obj =  content;
        
        setMainModal(modal);
    };
    
    // EDIT CONTENT
    $scope.edit_content = function(data){
        getScope(addContentModal).edit(data);
    };
    
    // BANNER'S ORDINATION 
    $scope.orderContents = function (orderArray) {
        
        if (!orderArray) {
            return false;
        }
        
        genericService.handler(pathContent, { order_contents: true, array: orderArray }).then(function (data) {
            showNotification();
        });
    }
    
    
    var getContent = function(banner){
        
        genericService.handler(pathContent, {getContent:true, search:'', homebanners_id: banner._id}).then(function (data) {
            if (checkMessage(data)) {
                banner.list = data;
                sortableContent();
            }
        });
    };
    
    /*##############################################################*/
    
    // FIRST CALL
    $scope.loadAll();
});

/*##############################################################*/
// BANNER BLOCK FORM
dbox.controller('addListModalController', function ($scope, genericService) {
    
    $scope.timers = {};
    $scope.list = {};
    $scope.old_scope = null;
    
    // SET TIMER OPTIONS AT THE TIMERS OBJECT
    $scope.setTimers = function () {
        
        genericService.json('homescreen/banners.timer.json').then(function (data) {
            $scope.timers = data;
        });
    };
    
    // EDIT BANNER BLOCK
    $scope.edit = function (data) {
        $scope.list = data;
        $scope.old_scope = angular.copy(data);
        
        $(addListModal).modal('show');
    };
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.list.loader = true;
            $scope.list.save = true;
            // ADD COUNTRY
            $scope.list.country = getScope("container").filter.country;
            
            // SAVE ON THE DATABASE
            genericService.form(path, $scope.list, doneSaveHomeBanner);
        }
    };
    
    // VALIDATE FORM
    var validation = function () {
        
        var error = '';
        delete $scope.list.error;
        
        if (isNullorEmpty($scope.list.title))
            error += errorTemplate('Title');
        if (isNullorEmpty($scope.list.timer))
            error += errorTemplate('Timer');
        if (isNullorEmpty($scope.list.status))
            error += errorTemplate('Status');
            
            
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.list, $scope.old_scope))
            error += errorTemplate('No changes to save');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.list.error = error;
            return false;
        }
        else {
            $scope.list.error = null;
            return true;
        }
    };
    
    // SET TIMERS
    $scope.setTimers();
});


dbox.controller('genericModal', function ($scope, genericService) {
    
    /*##############################################################*/
    //MODALS
    $scope.modal = {};
    
    $scope.modalAction = function (ac) {
        
        var keywords = null;
        $scope.modal.loader = 1;
        
        // DELETE APP
        if (ac == 'deleteBanner') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            
            genericService.handler(path, keywords).then(function (response) {
                if (checkMessage(response)) {
                    
                    modelAlertClose();
                    
                    getScope('container').loadAll();
                    $scope.modal = null;
                }
            });
        }
        // DELETE CONTENT
        else if (ac == 'deleteContent') {
            
            var obj = $scope.modal.obj;
            
            obj.delete = true;
            genericService.form(pathContent, obj, doneDeleteList);
        }
    };

});

function doneDeleteList(data) {
    
    modelAlertClose();

    getScope("genericModal").modal = null;
    getScope('container').loadAll();
    $(addListModal).modal('hide');
}

function doneSaveHomeBanner(data){
    
    var s = getScope(addListModal);
    
    s.list = {};
    s.$apply();
    
    getScope('container').loadAll();
    $(addListModal).modal('hide');
    
}

function sortableBanner() {
    
    var order = '.banner-order';
    try { $(order).sortable("destroy"); } catch (ex) { }
    $(order).sortable({
        stop: function (event, ui) {
            getScope("container").orderBanners(JSON.stringify($(this).sortable("toArray")));
        }
    });
}

function sortableContent() {
    
    var order = '.content-order';
    try { $(order).sortable("destroy"); } catch (ex) { }
    $(order).sortable({
        stop: function (event, ui) {
            getScope("container").orderContents(JSON.stringify($(this).sortable("toArray")));
        }
    });
}
