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
    },


    paths: {
        jquery: 'libs/jquery',
        underscore: 'libs/underscore',
        d3: 'libs/d3',
        backbone : 'libs/backbone',
    }
});


require(['search'],
    function(Search) {

        new Search.Search();


    }
);