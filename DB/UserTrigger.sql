
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS user_insert_trigger ON "User";
DROP TRIGGER IF EXISTS user_login_trigger ON "User";
DROP TRIGGER IF EXISTS user_logout_trigger ON "User";
DROP TRIGGER IF EXISTS user_update_trigger ON "User";


-- Function for logging Insert operations (User Created)
CREATE OR REPLACE FUNCTION log_user_insert()
RETURNS TRIGGER AS $$
BEGIN

    INSERT INTO audittrail (isactive, createdby, modifieddate, description, createddate, userid, auditeventid)
    VALUES (
        TRUE, -- isActive
        NEW.name, -- createdBy
        CURRENT_TIMESTAMP, -- modifiedDate
        CONCAT('User Created: ', NEW.name, ' at ', NEW.createdat), -- description
        NEW.createdat, -- createdDate
        NEW.userid, -- userID
        (SELECT id FROM auditevents WHERE event = 'User Created' AND module = 'User') -- auditEventID

    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for logging Login operations (User Logged In)
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN

    INSERT INTO audittrail (isactive, createdby, modifieddate, description, createddate, userid, auditeventid)
    VALUES (
        TRUE, -- isActive
        NEW.name, -- createdBy
        CURRENT_TIMESTAMP, -- modifiedDate
        CONCAT('User Logged In: ', NEW.name, ' at ', NEW.lastloginat), -- description
        NEW.lastloginat, -- createdDate
        NEW.userid, -- userID
        (SELECT id FROM auditevents WHERE event = 'User Logged In' AND module = 'User') -- auditEventID

    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for logging Logout operations (User Logged Out)
CREATE OR REPLACE FUNCTION log_user_logout()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audittrail (isactive, createdby, modifieddate, description, createddate, userid, auditeventid)
    VALUES (
        TRUE, -- isActive
        NEW.name, -- createdBy
        CURRENT_TIMESTAMP, -- modifiedDate
        CONCAT('User Logged Out: ', NEW.name, ' at ', NEW.lastlogoutat), -- description
        NEW.lastlogoutat, -- createdDate
        NEW.userid, -- userID
        (SELECT id FROM auditevents WHERE event = 'User Logged Out' AND module = 'User') -- auditEventID

    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for logging Update operations (User Updated)
CREATE OR REPLACE FUNCTION log_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the update event

    INSERT INTO audittrail (isactive, createdby, modifieddate, description, createddate, userid, auditeventid)
    VALUES (
        TRUE, -- isActive
        NEW.name, -- createdBy
        CURRENT_TIMESTAMP, -- modifiedDate
        CONCAT('User Updated: ', NEW.name, ' at ', NEW.updatedat), -- description
        NEW.updatedat, -- createdDate
        NEW.userid, -- userID
        (SELECT id FROM auditevents WHERE event = 'User Updated' AND module = 'User') -- auditEventID

    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
-- Trigger for user creation
CREATE TRIGGER user_insert_trigger
AFTER INSERT ON "User"
FOR EACH ROW
EXECUTE FUNCTION log_user_insert();

-- Trigger for user login
CREATE TRIGGER user_login_trigger
AFTER UPDATE ON "User"
FOR EACH ROW

WHEN (NEW.lastloginat IS NOT NULL AND OLD.lastloginat IS DISTINCT FROM NEW.lastloginat)

EXECUTE FUNCTION log_user_login();

-- Trigger for user logout
CREATE TRIGGER user_logout_trigger
AFTER UPDATE ON "User"
FOR EACH ROW

WHEN (NEW.lastlogoutat IS NOT NULL AND OLD.lastlogoutat IS DISTINCT FROM NEW.lastlogoutat)

EXECUTE FUNCTION log_user_logout();

-- Trigger for general user updates
CREATE TRIGGER user_update_trigger
AFTER UPDATE ON "User"
FOR EACH ROW

WHEN (NEW.lastloginat IS NULL AND NEW.lastlogoutat IS NULL AND 
      (OLD.name IS DISTINCT FROM NEW.name OR OLD.email IS DISTINCT FROM NEW.email))
EXECUTE FUNCTION log_user_update();

-- Test SQL
-- Insert a new user to trigger the log_user_insert function
INSERT INTO "User" (email, name, password)

VALUES ('testuser@example.com', 'Test User', 'password123');

-- Update the user's name to trigger the log_user_update function
UPDATE "User"

SET name = 'Updated User', updatedat = CURRENT_TIMESTAMP
WHERE email = 'testuser@example.com';

-- Update lastloginat to trigger the log_user_login function
UPDATE "User"
SET lastloginat = CURRENT_TIMESTAMP
WHERE email = 'testuser@example.com';

-- Update lastlogoutat to trigger the log_user_logout function
UPDATE "User"
SET lastlogoutat = CURRENT_TIMESTAMP
WHERE email = 'testuser@example.com';

-- View audit trail entries
SELECT * FROM audittrail;

