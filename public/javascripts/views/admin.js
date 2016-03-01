var adminModal = "#adminModal";
var path = '/handler/admin';

dbox.controller('adminListController', function ($scope, genericService) {
    
    $scope.admins = null;
    $scope.limits = getShowLimit();

    $scope.filter = {
        search: '',
        status: '1',
        pg: { index: 0, limit: '25',
            range: 0,
            total: 0}
    }
    
    
    // RESET SEARCH FILTER
    $scope.rSearch = function () {
        
        $scope.filter.search = "";
        $scope.filter.pg.index = 0;
        $scope.search();
    };
    
    // SEARCH ADMINS
    $scope.search = function () {
        
        // GET ALL DATA ON THE BASE
        genericService.handler(path, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.admins = data;
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
    

    // NEW ADMIN
    $scope.new = function () {
        var data = {status:true};
        setAdminModal(data);
    };

    // EDIT ADMIN
    $scope.edit = function (data) {

        setAdminModal(data);
    };

    // DELETE ADMIN
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete admin';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the admin <b>' + data.firstname + '</b>?';
        modal.invoke = 'deleteAdmin';
        modal.obj = data;
        
        setMainModal(modal);
    };
    
    // OPEN UP MODAL EDITING
    var setAdminModal = function (data) {
        
        var s = getScope("adminModal");
        
        s.admin = data;
        s.old_scope = angular.copy(data);

        $(adminModal).modal('show');
    };

    // INIT
    $scope.search();
});

dbox.controller('genericModal', function ($scope, genericService) {
    
    /*##############################################################*/
    //MODALS
    $scope.modal = {};
    
    $scope.modalAction = function (ac) {
        
        var keywords = null;
        $scope.modal.loader = 1;
        
        // DELETE ADMIN
        if (ac == 'deleteAdmin') {
            
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

dbox.controller('adminModalController', function ($scope, genericService) {
    $scope.admin = null;
    $scope.old_scope = null;


    $scope.save = function () {
        
        if (validation()) {
            
            $scope.admin.loader = true;
            $scope.admin.save = true;

            genericService.handler(path, $scope.admin).then(function (data) {
                
                if (checkMessage(data)) {
                    $scope.admin.loader = null;
                    listAdmin();
                }

            });

        }
    };
    
    // CHECK IF USERNAME IS AVAILABLE
    $scope.checkUsername = function () {
        
        if (isNullorEmpty($scope.admin.username)) {
            return false;
        }

        $scope.admin.username_load = 1;
        // GET NUMBER OF DATA ON THE BASE
        genericService.handler(path, { username: $scope.admin.username, check: true }).
        then(function (data) {

            if (JSON.stringify(data) != '[]' && data[0]._id != $scope.admin._id) {
                $scope.admin.check_username = $scope.admin.username + ' is unavailable';
                $scope.admin.username = '';
            }
            else{
                $scope.admin.check_username = 'Available';
            }
            
            $scope.admin.username_load = null;
        });
    };
    
    var listAdmin = function () {

        $(adminModal).modal('hide');
        getScope("container").rSearch();

    }

    var validation = function () {
        
        var error = '';
        delete $scope.admin.error;
        
        if (isNullorEmpty($scope.admin.firstname))
            error += errorTemplate('First name');
        if (isNullorEmpty($scope.admin.lastname))
            error += errorTemplate('Last name');
        if (isNullorEmpty($scope.admin.username))
            error += errorTemplate('Username');
        if (!isNullorEmpty($scope.admin.mail)) {
            if(!validateEmail($scope.admin.mail))
                error += errorTemplate('E-mail');
        }
        
        if (isNullorEmpty($scope.admin.status))
            error += errorTemplate('Status');
        
        // password
        if (isNullorEmpty($scope.admin.password) && isNullorEmpty($scope.admin._pass))
            error += errorTemplate('Password');
        else if (isNullorEmpty($scope.admin.password) && isNullorEmpty($scope.admin._pass))
            error += errorTemplate('Password');
        else if ($scope.admin._rpass != $scope.admin._pass) {

            if ((!isNullorEmpty($scope.admin._rpass)) && (!isNullorEmpty($scope.admin._pass))) {
                error += errorTemplate('Password');
            }
        }
        else if ((!isNullorEmpty($scope.admin._pass)) && $scope.admin._pass.length < 5) {
            error += errorTemplate('Password at least 5 characters');
        }
        else if(!isNullorEmpty($scope.admin._rpass)) {
            $scope.admin.password = $scope.admin._rpass;
            $scope.admin.password_update = true;
        }
        
        if 
        (
            (!getBoolean( $scope.admin.superadmin )) &&
            (!getBoolean( $scope.admin.live )) && (!getBoolean( $scope.admin.movie ))  && 
            (!getBoolean( $scope.admin.tvseries )) && (!getBoolean( $scope.admin.community )) && (!getBoolean( $scope.admin.customer )) &&
            (!getBoolean( $scope.admin.homeapps )) && (!getBoolean( $scope.admin.homebackground )) && (!getBoolean( $scope.admin.homesponsors )) && 
            (!getBoolean( $scope.admin.homesupport )) && (!getBoolean( $scope.admin.homebanners )) && (!getBoolean( $scope.admin.homehighlights )) &&
            (!getBoolean( $scope.admin.homemenu )) && (!getBoolean( $scope.admin.homewidgets ))   
        ) 
        {
            error += errorTemplate('At least one permission');
        }
        
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.admin, $scope.old_scope))
            error += errorTemplate('No changes to save');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.admin.error = error;
            return false;
        }
        else{
            $scope.admin.error = null;
            return true;
        }
    };
});
