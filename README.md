# Super Dynamic React Form

You've seen dynamic forms in React in posts like Aaron Powell's https://www.aaron-powell.com/posts/2020-12-10-dynamic-forms-with-react-hooks/

But that was the easy case, where the server sends you everything at once.

What if you have to fetch a select field's Options with a separate async call?
What if you have to fetch the Conditional Fields by pseudo-submitting the unfinished unvalidated form to a second endpoint to receive a similar half-finished form with those new fields added? (This breaks Formik's assumptions.)
What if fetching the new conditional fields then requires fetching the Options for those new fields as well?
What if fetching the Options for a field is also dependant on another field's current value (i.e., getting the provinces depends on the value of the countries field)?

This is what we're going to do.

### `npm run start`

Runs the app in the development mode on [http://localhost:3000](http://localhost:3000)

Was formerly a create-react-app app, but react-scripts breaks the Typescript on useAsync's tuple.
