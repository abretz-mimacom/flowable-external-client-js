echo $1
scp -i "MSKKeyPair.pem" ec2-user@ec2-51-20-192-6.eu-north-1.compute.amazonaws.com:~/extended_medical_records_export.csv .
