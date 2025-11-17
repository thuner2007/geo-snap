const React = require('react');
const renderer = require('react-test-renderer');

function LocationCard({ title }) {
  return React.createElement('div', null, 
    React.createElement('h2', null, title)
  );
}

const tree = renderer.create(
  React.createElement(LocationCard, { title: 'Test' })
).toJSON();

console.log('Tree:', JSON.stringify(tree, null, 2));
