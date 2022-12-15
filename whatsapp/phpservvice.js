var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'PHPService',
  description: 'The nodejs.org example web server.',
  execPath:"C:\\xampp\\php",
  script: 'C:\\xampp\\htdocs\\scs',
  nodeOptions: [
    'artisan serve'
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();