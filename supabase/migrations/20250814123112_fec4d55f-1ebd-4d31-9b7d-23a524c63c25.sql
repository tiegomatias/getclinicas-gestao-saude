-- Add start_date field to professionals table
ALTER TABLE professionals ADD COLUMN start_date DATE;

-- Add initial_password field for temporary storage (will be cleared after user creation)
ALTER TABLE professionals ADD COLUMN initial_password TEXT;

-- Add password_changed field to track if user has changed their initial password
ALTER TABLE professionals ADD COLUMN password_changed BOOLEAN DEFAULT FALSE;