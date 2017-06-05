Jobsity Front-end Challenge.

This is a react component that manages a list of attributes and displays the output in JSON format live.

The form has a save button that gets disabled if any of the attributes is invalid according to the following rules:

- No duplicated names.
- All required fields have a valid value.
- Number format validation:
    - Min rane, max range, precision and accuracy must be numeric values.
    - Min range must be smaller than max range.
    - Precision and accuracy must divide the difference between min and max range exactly.
    
Each tab represents a different category, new attributes will be added to the currently selected category.

##Development
```
npm install
npm start
```

