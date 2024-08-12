const SourceConnection = ({ open, closeForm }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    database: '',
    type: '',
    host: '',
    port: '',
    alias: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
  };

  return (
    <Dialog open={open} onClose={closeForm}>
      <DialogTitle>Source Connection</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <div className={styles.formContainer}>
            <div className={styles.formItem}>
              <TextField
                margin="dense"
                id="username"
                name="username"
                label="Username"
                type="text"
                fullWidth
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formItem}>
              <TextField
                margin="dense"
                id="password"
                name="password"
                label="Password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.formItem}>
              <TextField
                margin="dense"
                id="database"
                name="database"
                label="Database"
                type="text"
                fullWidth
                value={formData.database}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formItem}>
              <TextField
                margin="dense"
                id="type"
                name="type"
                label="Type"
                select
                fullWidth
                value={formData.type}
                onChange={handleChange}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="type1">Type 1</MenuItem>
                <MenuItem value="type2">Type 2</MenuItem>
              </TextField>
            </div>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.formItem}>
              <TextField
                margin="dense"
                id="host"
                name="host"
                label="Host"
                type="text"
                fullWidth
                value={formData.host}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formItem}>
              <TextField
                margin="dense"
                id="port"
                name="port"
                label="Port"
                type="text"
                fullWidth
                value={formData.port}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.formItem}>
              <TextField
                margin="dense"
                id="alias"
                name="alias"
                label="Alias"
                type="text"
                fullWidth
                value={formData.alias}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogActions className={styles.formActions}>
            <Button type="submit" color="primary" className={styles.connectSourceButton}>
              Connect Source
            </Button>
            <Button onClick={closeForm} className={styles.closeButton}>
              Close
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

SourceConnection.propTypes = {
  open: PropTypes.bool.isRequired,
  closeForm: PropTypes.func.isRequired,
};

export default SourceConnection;
