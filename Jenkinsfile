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
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
            }
        }
        
        stage('Deploy to K8s') {
            steps {
                sh """
                    # 更新镜像tag
                    sed -i 's|image:.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|g' k8s/deployment.yaml
                    
                    # 部署
                    kubectl apply -f k8s/deployment.yaml -n ${NAMESPACE}
                    
                    # 强制更新Pod
                    kubectl rollout restart deployment/pixel-farm-game -n ${NAMESPACE} || true
                """
            }
        }
        
        stage('Cleanup Old Images') {
            steps {
                sh """
                    docker images ${IMAGE_NAME} --format '{{.Tag}}' | grep -v '${IMAGE_TAG}' | grep -v 'latest' | xargs -I {} docker rmi ${IMAGE_NAME}:{} || true
                """
            }
        }
    }
    
    post {
        success {
            echo "部署成功！访问 http://服务器IP:30080"
        }
        failure {
            echo '部署失败'
        }
    }
}
