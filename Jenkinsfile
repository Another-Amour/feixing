pipeline {
    agent any

    environment {
        IMAGE_NAME = 'pixel-farm-game'
        IMAGE_TAG = "${BUILD_NUMBER}"
        NAMESPACE = 'default'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
                sh 'docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest'
            }
        }

        stage('Deploy to K8s') {
            steps {
                sh 'sed -i "s|image:.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|g" k8s/deployment.yaml'
                sh 'kubectl apply -f k8s/deployment.yaml -n ${NAMESPACE}'
                sh 'kubectl rollout restart deployment/pixel-farm-game -n ${NAMESPACE} || true'
            }
        }

        stage('Cleanup') {
            steps {
                sh 'docker image prune -f || true'
            }
        }
    }

    post {
        success {
            echo '部署成功！'
        }
        failure {
            echo '部署失败'
        }
    }
}
