require.config({
    baseUrl: '/static/js/',

    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        d3: {
            deps: ['jquery'],
            exports: 'd3'
        },
        tip: {
            deps: ['d3'],
            exports: 'tip'
        },
    },


    paths: {
        jquery: 'libs/jquery',
        underscore: 'libs/underscore',
        d3: 'libs/d3',
        tip: 'libs/tip',

        backbone: 'libs/backbone',
    }
});


require(['router', 'search'],
    function(Router, Search) {
        var router = new Router.Router();
        Backbone.history.start();
    }
);