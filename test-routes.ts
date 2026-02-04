// Test script to verify route mapping and SPA POST endpoint
import { MakeApp } from './ui.server';
import ui from './ui';

const app = MakeApp('en');

app.Page('/', 'Home Page', function(ctx) {
  return ui.div('p-4')('Hello World');
});

app.Page('/about', 'About', function(ctx) {
  return ui.div('p-4')('About Page');
});

app.Page('/users/{id}', 'User Profile', function(ctx) {
  return ui.div('p-4')('User: ' + ctx.PathParam('id'));
});

// Print route mappings
console.log('=== Route mappings ===');
for (const [path, route] of app.routes.entries()) {
  console.log(path, '->', {
    path: route.path,
    title: route.title,
    hasParams: route.hasParams,
  });
}

console.log('\n=== SPA Navigation ===');
console.log('Routes are now accessed via POST to the route path directly');
console.log('Client sends: POST /about with body: {"path": "/about?foo=bar"}');
console.log('Server returns: JSON with {el: JSElement, ops: [], title: string}');
