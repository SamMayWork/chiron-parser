-> START PAGE
-> APPLY basic-deployment.yaml
-> WAIT pods NAME basic-deployment COUNT EQUALS 3

# Basics of Deployments

When working with deployments there are some key commands that you should know:
  - kubectl get pods
  - kubectl get deployments

These commands let you see the deployments that have been created in the Cluster and the pods that these have produced. Let's look at the command output for this.

Try Running: `kubectl get deployments`

-> COMMANDWAIT kubectl get deployments
-> END PAGE
-> START PAGE

# Basics of Deployments

Great, now on the right-hand terminal window you can see the deployments that have been created on the system. Let's look at the pods that are a child of this deployment.

Try Running: `kubectl get pods`

-> COMMANDWAIT kubectl get pods
-> END PAGE