-- Function for logging Insert operations (Report Created)
CREATE OR REPLACE FUNCTION log_report_insert()
RETURNS TRIGGER AS $$
DECLARE
    event_id INT;
    application_name TEXT;
    user_name TEXT;
BEGIN
    -- Retrieve the AuditEventID for "Report Created"
    SELECT id INTO event_id FROM auditevents WHERE event = 'Report Created' AND module = 'Report';

    -- Retrieve the Application Name
    SELECT Name INTO application_name FROM Application WHERE ApplicationID = NEW.applicationid;

    -- Retrieve the User Name
    SELECT Name INTO user_name FROM "User" WHERE UserID = NEW.userid;

    -- Insert the log into the AuditTrail table
    INSERT INTO AuditTrail (
        IsActive,
        CreatedBy,
        ModifiedDate,
        Description,
        CreatedDate,
        UserID,
        AuditEventID
    )
    VALUES (
        TRUE, -- IsActive
        application_name, -- CreatedBy (Application Name)
        CURRENT_TIMESTAMP, -- ModifiedDate
        CONCAT('Report Created for ', application_name, ' by ', user_name, ' at ', NEW.createdat), -- Description
        NEW.createdat, -- CreatedDate
        NEW.userid, -- UserID
        event_id -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for logging Update operations (Report Updated, Deleted, Restored, Parameters Modified)
-- Function for logging Update operations (Report Updated, Deleted, Restored, Parameters Modified)
CREATE OR REPLACE FUNCTION log_report_update()
RETURNS TRIGGER AS $$
DECLARE
    event_id INT;
    event_description TEXT;
    application_name TEXT;
    user_name TEXT;
BEGIN
    -- Retrieve the Application Name
    SELECT Name INTO application_name FROM Application WHERE ApplicationID = NEW.applicationid;

    -- Retrieve the User Name
    SELECT Name INTO user_name FROM "User" WHERE UserID = NEW.userid;

    -- Determine the event type and description
    CASE
        WHEN OLD.isdeleted = FALSE AND NEW.isdeleted = TRUE THEN
            event_description := CONCAT('Report Deleted for ', application_name, ' by ', user_name, ' at ', NEW.updatedat);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Report Deleted' AND module = 'Report';
        WHEN OLD.isdeleted = TRUE AND NEW.isdeleted = FALSE THEN
            event_description := CONCAT('Report Restored for ', application_name, ' by ', user_name, ' at ', NEW.updatedat);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Report Restored' AND module = 'Report';
        WHEN OLD.parameters::jsonb IS DISTINCT FROM NEW.parameters::jsonb THEN
            event_description := CONCAT('Report Parameters Modified for ', application_name, ' by ', user_name, ' at ', NEW.updatedat);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Report Parameters Modified' AND module = 'Report';
        ELSE
            event_description := CONCAT('Report Updated for ', application_name, ' by ', user_name, ' at ', NEW.updatedat);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Report Updated' AND module = 'Report';
    END CASE;

    -- Insert the log into the AuditTrail table
    INSERT INTO AuditTrail (
        IsActive,
        CreatedBy,
        ModifiedDate,
        Description,
        CreatedDate,
        UserID,
        AuditEventID
    )
    VALUES (
        TRUE, -- IsActive
        application_name, -- CreatedBy (Application Name)
        CURRENT_TIMESTAMP, -- ModifiedDate
        event_description, -- Description
        NEW.updatedat, -- CreatedDate
        NEW.userid, -- UserID
        event_id -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger for report insertion
CREATE TRIGGER report_insert_trigger
AFTER INSERT ON report
FOR EACH ROW
EXECUTE FUNCTION log_report_insert();

-- Trigger for report updates, including delete, restore, and parameter modifications
CREATE TRIGGER report_update_trigger
AFTER UPDATE ON report
FOR EACH ROW
EXECUTE FUNCTION log_report_update();




-- Insert into the report table (this should trigger the 'Report Created' event)
INSERT INTO report (title, description, generationdate, applicationid, userid, createdat)
VALUES ('Annual Report', 'Description for annual report', CURRENT_TIMESTAMP, 1, 1, CURRENT_TIMESTAMP);

-- Update the report title (this should trigger the 'Report Updated' event)
UPDATE report
SET title = 'Updated Annual Report', updatedat = CURRENT_TIMESTAMP
WHERE reportid = 1;

-- Modify report parameters (this should trigger the 'Report Parameters Modified' event)
UPDATE report
SET parameters = '{"param1": "value1", "param2": "value2"}', updatedat = CURRENT_TIMESTAMP
WHERE reportid = 1;

-- Soft delete the report (this should trigger the 'Report Deleted' event)
UPDATE report
SET isdeleted = TRUE, updatedat = CURRENT_TIMESTAMP
WHERE reportid = 1;

-- Restore the report (this should trigger the 'Report Restored' event)
UPDATE report
SET isdeleted = FALSE, updatedat = CURRENT_TIMESTAMP
WHERE reportid = 1;

-- Check the AuditTrail table for the logs
SELECT * FROM AuditTrail WHERE UserID = 1;

-- Check the AuditEvents for the Report module
SELECT * FROM auditevents WHERE module = 'Report';







select * from audittrail a 

select * from destination d 


select * from auditevents a where "module" ='Report'