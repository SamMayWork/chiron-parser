-> START PAGE
-> APPLY content.yaml
-> WAIT pod NAME basic-deployment COUNT EQUALS 3

## Tutorial

This is the first stage of my awesome tutorial!

-> COMMANDWAIT kubectl get deployments
-> COMMANDWAIT kubectl get deployments
-> COMMANDWAIT kubectl get deployments
-> CHECK pod NAME basic-deployment COUNT EQUALS 3
-> CHECK pod NAME some-other-deployment COUNT EQUALS 3
-> END PAGE
-> START PAGE

-> APPLY content.yaml

# Tutorial-2

This is the second stage of my awesome tutorial!

-> COMMANDWAIT ls -al
-> END PAGE