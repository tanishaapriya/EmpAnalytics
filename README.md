# EmpAnalytics

A comprehensive employee management and analytics system with machine learning capabilities for employee attrition prediction.

## Features

- **Employee Management**: View, manage, and track employee information
- **Performance Tracking**: Monitor employee performance metrics and reviews
- **Attrition Prediction**: Machine learning model to predict employee attrition risk
- **Task Management**: Assign and track employee tasks
- **Dashboard**: Real-time analytics and insights
- **Authentication**: Secure login system

## Project Structure

```
EmpAnalytics/
├── backend/                 # Python Flask backend
│   ├── app.py              # Main application file
│   ├── db.py               # Database configuration
│   ├── data.py             # Data processing utilities
│   ├── train_model.py      # ML model training script
│   ├── attrition_model.pkl # Trained attrition model
│   ├── routes/             # API routes
│   │   ├── auth_routes.py
│   │   ├── employee_routes.py
│   │   ├── attrition_routes.py
│   │   ├── performance_routes.py
│   │   └── task_routes.py
│   ├── requirements.txt    # Python dependencies
│   ├── schema.sql          # Database schema
│   └── dbms_ml.csv         # Training dataset
├── js/                      # Frontend JavaScript
│   ├── main.js
│   ├── dashboard.js
│   ├── employees.js
│   ├── attrition.js
│   ├── performance.js
│   ├── tasks.js
│   ├── landing.js
│   └── config.js
├── css/                     # Frontend Stylesheets
│   ├── styles.css
│   └── landing.css
├── assets/                  # Images and static assets
│   └── images/
├── index.html              # Landing page
├── dashboard.html          # Dashboard page
├── employees.html          # Employees page
├── attrition.html          # Attrition analysis page
├── performance.html        # Performance page
├── tasks.html              # Tasks page
└── login.html              # Login page
```

## Prerequisites

- Python 3.8 or higher
- Node.js (for frontend development)
- MySQL or compatible database

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up the database:
```bash
# Create database and tables
mysql -u [username] -p < schema.sql
```

4. Configure database connection in `db.py`

5. Train the ML model:
```bash
python train_model.py
```

### Running the Application

1. Start the backend server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

## API Endpoints

- **Auth Routes**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/register`
- **Employee Routes**: `/api/employees`, `/api/employees/<id>`
- **Performance Routes**: `/api/performance`, `/api/performance/<employee_id>`
- **Attrition Routes**: `/api/attrition/predict`
- **Task Routes**: `/api/tasks`, `/api/tasks/<id>`

## Machine Learning

The attrition prediction model is trained using historical employee data to identify at-risk employees. The model is saved as `backend/attrition_model.pkl` and can be retrained with new data using:

```bash
python backend/train_model.py
```

## Database Schema

The system uses the following main tables:
- `employees`: Employee information
- `performance`: Performance reviews and metrics
- `tasks`: Task assignments and tracking
- `attrition_data`: Historical attrition data for model training

See `backend/schema.sql` for complete schema details.

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: MySQL
- **Machine Learning**: Python ML libraries (scikit-learn, pandas, numpy)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Contact

For questions or support, please contact the development team.
