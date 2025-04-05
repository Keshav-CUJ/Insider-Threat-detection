# Welcome to Insider Threat Detection World

Insider threats are among the most challenging cybersecurity risks, where individuals within an organization—such as employees, contractors, or partners—intentionally or unintentionally compromise sensitive information. These threats can manifest as data leaks through emails, unauthorized access to confidential files, or even sabotage of critical systems.

## About the Project

I have provided a full-fledged AI model for detecting insiders based on their system logs, email communications, web browsing, and more.

- The model is trained on the **CERT dataset (version 4.2)**, which can be found at: [CERT Dataset v4.2](https://kilthub.cmu.edu/articles/dataset/Insider_Threat_Test_Dataset/12841247/1)
- After extensive preprocessing and feature extraction, the data is fed into an **LSTM-Autoencoder**, which predicts risk scores.
- The **`model`** folder contains the trained model.
- Other folders contain datasets and related files as named.


## Don't Pull this branch as it consist model and training only, for dashboard pull the following branches : 


## Check out the interactive dashboard:   ### [Click on the image for video]

### Part 1 : Shows Real Time insider threat detection
[![Watch the video](https://img.youtube.com/vi/XHeZeiMYr60/0.jpg)](https://www.youtube.com/watch?v=XHeZeiMYr60)

### To explore the dashboard: 

- **Backend:** [GitHub Repo](https://github.com/Keshav-CUJ/Insider-Threat-detection/tree/RealtimeBackend)
- **Frontend :** [GitHub Repo](https://github.com/Keshav-CUJ/Insider-Threat-detection/tree/Real%2BDailyFrontend))


### Part 2 : Shows daily basis insider threat detection
[![Watch the video](https://img.youtube.com/vi/6VqIfOs4PuI/0.jpg)](https://www.youtube.com/watch?v=6VqIfOs4PuI)

### To explore the dashboard: 

- **Backend:** [GitHub Repo](https://github.com/Keshav-CUJ/Insider-Threat-detection/tree/DailyBasisBackend)
- **Frontend:** [GitHub Repo](https://github.com/Keshav-CUJ/Insider-Threat-detection/tree/Real%2BDailyFrontend)


## Know More about my work
### Proposed Solution:-
   ![Techinical Approach](./preprocessing%20and%20feature%20extraction/performance%20metrices/Screenshot%202025-03-22%20103035.png)
### Model Architecture:-
   ![Techinical Approach](./preprocessing%20and%20feature%20extraction/performance%20metrices/Screenshot%202025-03-22%20103055.png)
### Familiar with some features:-
   ![Techinical Approach](./preprocessing%20and%20feature%20extraction/performance%20metrices/Screenshot%202025-03-22%20103123.png)
### Know about User's Activity Graph:-
   ![Techinical Approach](./preprocessing%20and%20feature%20extraction/performance%20metrices/Screenshot%202025-03-22%20104203.png)
### Know about network of insiders:-
   ![Techinical Approach](./preprocessing%20and%20feature%20extraction/performance%20metrices/Screenshot%202025-03-22%20104209.png)
## Performance Metrics

### Accuracy: **92%**

### Confusion Matrix:
![Confusion Matrix](./preprocessing%20and%20feature%20extraction/performance%20metrices/output3.png)

### ROC-AUC Curve:
![ROC-AUC Curve](./preprocessing%20and%20feature%20extraction/performance%20metrices/output4.png)

### Reconstruction Error Distribution:
![Reconstruction Error Distribution](./preprocessing%20and%20feature%20extraction/performance%20metrices/output2.png)

### Epoch vs Validation Loss:
![Epoch vs Val Loss](./preprocessing%20and%20feature%20extraction/performance%20metrices/output.png)




You can also visit the **live website** (note: free hosting may cause slow performance):

🔗 [Live Dashboard](https://frontend-of-itd.onrender.com)
 <p>It will ask for input csv so you can provide it from "sample data" folder</p>


