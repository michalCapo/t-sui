# Comprehensive Form Example

A complete t-sui form demonstrating all available input components with prefilled values and submitted data display.

## Features

### Input Components Included

1. **Text & Password**
   - Full Name (text input)
   - Email (text input)
   - Password (password input)
   - Confirm Password (password input)

2. **Textarea**
   - Biography (multi-line textarea)

3. **Number Inputs**
   - Age (with min/max constraints)
   - Years of Experience (with decimal support)

4. **Date & Time**
   - Birth Date (date picker)
   - Meeting Time (time picker)
   - Created At (datetime picker)

5. **Select Dropdowns**
   - Country (with options)
   - Department (with empty option placeholder)

6. **Checkboxes**
   - Agree to Terms (required)
   - Newsletter Subscription

7. **Radio Buttons**
   - Gender (Male, Female, Other)
   - Experience Level (Beginner, Intermediate, Advanced)

8. **Hidden Fields**
   - User ID (stored but not visible)

### Key Features

- ✅ **Prefilled Values**: All form fields come with sample data
- ✅ **Validation**: Required field validation on submit
- ✅ **Form Association**: Uses `ui.Form` instance for proper HTML form binding
- ✅ **Data Display**: Shows submitted data in a success message after form submission
- ✅ **Responsive Layout**: Grid-based layout for multiple columns
- ✅ **Styled Sections**: Each component type grouped in organized sections with icons and headers
- ✅ **Error Handling**: Shows error messages for validation failures

## Usage

The form is available at: `http://localhost:1423/comprehensive-form`

### Form Data Structure

```typescript
class ComprehensiveFormData {
    fullName = 'John Doe';
    email = 'john@example.com';
    password = 'SecurePass123!';
    confirmPassword = 'SecurePass123!';
    bio = 'Passionate developer and open-source enthusiast.';
    age = 28;
    experience = 5.5;
    birthDate = '1996-03-15';
    meetingTime = '14:30';
    createdAt = '2024-02-04T10:30';
    country = 'us';
    department = 'engineering';
    agreeTerms = true;
    newsletter = false;
    gender = 'male';
    experience_level = 'intermediate';
    userId = '12345';
}
```

### How It Works

1. **Initial Load**: Form displays with all fields prefilled with default values
2. **User Input**: User can modify any field value
3. **Submission**: On form submission, data is sent to server
4. **Validation**: Required fields are checked server-side
5. **Response**: 
   - If validation fails: Error message shown, form re-rendered
   - If validation passes: Success message with all submitted values displayed

### Submitted Data Display

After successful submission, a green success box displays all submitted values in a table format:

```
✓ Form Submitted Successfully

Full Name: John Doe
Email: john@example.com
Password: ***[last 4 chars]
Bio: Passionate developer and open-source enthusiast.
Age: 28
Experience (years): 5.5
Birth Date: 1996-03-15
Meeting Time: 14:30
Created At: 2024-02-04T10:30
Country: us
Department: engineering
Gender: male
Experience Level: intermediate
Agree to Terms: ✓ Yes
Newsletter: ✗ Not subscribed
User ID: 12345
```

## Integration into Your App

To add this form to the example app:

1. The form is automatically registered in `examples/app.ts`
2. Route: `/comprehensive-form`
3. Form submission handler: `/comprehensive-form-submit`

## Code Location

- **Form Component**: `/examples/pages/comprehensive-form.ts`
- **App Configuration**: `/examples/app.ts` (routes array)

## Component Reference

### Form Instance Methods

The example uses `ui.Form` instance for form association:

```typescript
const f = new ui.Form(ctx.Submit(onSubmit).Replace(target));

// Available methods:
f.Text('fieldName', data)           // Text input
f.Password('fieldName', data)       // Password input
f.Area('fieldName', data)           // Textarea
f.Number('fieldName', data)         // Number input
f.Date('fieldName', data)           // Date picker
f.Time('fieldName', data)           // Time picker
f.DateTime('fieldName', data)       // DateTime picker
f.Select('fieldName', data)         // Select dropdown
f.Checkbox('fieldName', data)       // Checkbox
f.Radio('fieldName', data)          // Radio button
f.RadioButtons('fieldName', data)   // Radio group
f.Button()                          // Submit button
f.Render()                          // Render the form (required)
```

### Form Data Parsing

```typescript
function onSubmit(ctx: Context): string {
    const submittedData = new ComprehensiveFormData();
    ctx.Body(submittedData);  // Automatically parses form data
    
    // Data is now available in submittedData object
    console.log(submittedData.fullName);
}
```

## Styling

The form uses **Tailwind CSS** classes for styling:
- White card containers with borders
- Section headers with bottom borders
- Two-column grids for layout
- Responsive spacing with gap utilities
- Color-coded success message (green)

## Notes

- All form fields are properly bound using HTML `form` attribute
- Form data is sent as `application/x-www-form-urlencoded`
- Fields with data type coercion: numbers, dates automatically converted
- Hidden fields are submitted but not displayed to user
- WebSocket patches enable real-time form updates without page reload
