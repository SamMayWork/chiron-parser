-> START PAGE

# Introduction

In this tutorial, we'll be looking at the basics of how Kubernetes creates applications and runs them, and how some basic command line commands work.

On the right hand side of the page is an interactive terminal that can be used to interact with the cluster, in fact, any commands work in this terminal!

Give `ls -al` a go!

-> COMMANDWAIT ls -al
-> END PAGE

-> START PAGE
-> APPLY basic-deployment.yaml
-> WAIT pod NAME basic-deployment COUNT EQUALS 3

# Deployments

Awesome, now you can see the output of the command on the right hand side!

Let's take a look at how Kubernetes deploys applications now so that they're actually doing aomething.

Typically, applications are deployed to Kubernetes as part of a base **resource** called Deployments. We've created a deployment on your cluster using this file:

```YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: basic-deployment
  namespace: default
  labels:
    app: basic-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: basic-deployment
  template:
    metadata:
      labels:
        app: basic-deployment
    spec:
      containers:
      - name: basic-deployment
        image: ssmay0/simple-container
        ports:
        - containerPort: 8080
```

You can now see what deployments are on the cluster using the command `kuebctl get deployments`, give it a go!

-> COMMANDWAIT kubectl get deployments
-> END PAGE
-> START PAGE

# Deployments Continued

The output from the command should look something like:

```
kubectl get deployments

NAME               READY   UP-TO-DATE   AVAILABLE   AGE
basic-deployment   3/3     3            3           13h
```

Here this shows that Kubernetes has created our deployment. **The Deployment itself does nothing but define how the application should be deployed,** the deployment simply isntructs Kubernetes to create your application. Your application is actually run by another resource called pods. The `READY 3/3` refers to how many pods are currently running your application.

Run `kubectl get pods` to see the current pods on the cluster!

-> COMMANDWAIT kubectl get pods
-> END PAGE
-> START PAGE

# Pods

Your output should look like this:

```
kubectl get pods

NAME                                READY   STATUS    RESTARTS   AGE
basic-deployment-5cbbdc6d75-94sj7   1/1     Running   0          13h
basic-deployment-5cbbdc6d75-dq2z6   1/1     Running   0          13h
basic-deployment-5cbbdc6d75-krwj7   1/1     Running   0          13h
```

We can find out more information about each pod by running `kubectl describe pod <pod name>`

-> COMMANDWAIT kubectl describe pod *
-> END PAGE
-> START PAGE

# Pods

Currently your application is being served by 3 pods, but we can tweak this number to our liking. Let's scale up your application so it's being run by 10 pods instead.

Run `kubectl scale deployment basic-deployment --replicas 10`

-> COMMANDWAIT kubectl scale deployment basic-deployment --replicas 10
-> CHECK pod NAME basic-deployment COUNT EQUALS 10