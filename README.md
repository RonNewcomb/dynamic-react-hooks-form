# Super Dynamic React Form

You've seen dynamic forms in React in posts like Aaron Powell's https://www.aaron-powell.com/posts/2020-12-10-dynamic-forms-with-react-hooks/

But that was the easy case, where the server sends you everything at once.

What if you have to fetch a select field's Options with a separate async call?
What if you have to fetch the Conditional Fields by pseudo-submitting the unfinished unvalidated form to a second endpoint to receive a similar half-finished form with those new fields added? (This breaks Formik's assumptions.)
What if fetching the new conditional fields then requires fetching the Options for those new fields as well?
What if fetching the Options for a field is also dependant on another field's current value (i.e., getting the provinces depends on the value of the countries field)?

This is what we're going to do.

### `npm run start`

React Hooks leans hard into Functional Programming, particularly its preference for immutable data. This makes our job harder since this form is all about input from users and servers at any time, and outputting state to servers and the rest of the app.

We use a fairly standard `useAsync` hook for the initial fetch of the fields that should appear. We assume a recursive structure of fields which can contain other fields. (The server may have notions of pages, sections, fieldsets, or just plain ol' groups.) The data from useAsync is supposed to be immutable, and when we try to do a pseudo-submit, find we cannot change it. So we declare a `current` useState which will point to the form from useAsync or pseudo-submit as appropriate.

We _will_ mutate-in-place `current`. After all, we're accepting user input without monads so what's one more FP paradigm-break? Also, re-render hacks ahoy.

Since we're doing several async calls to getOption and pseudoSubmit during the form's lifetime, we really need to prevent users modifying the form during calls. So we use an Overlay that prevents touching everything in the form while a call is in flight.

We also need to handle server errors well since there's potential for so many of them. Such forms have a lot of user input and we don't wish to lose any of their work because the backend timed out once.
