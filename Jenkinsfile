pipeline {
    agent any
    
    environment {
        IMAGE_NAME = 'pixel-farm-game'
        IMAGE_TAG = "${BUILD_NUMBER}"
        CONTAINER_PORT = '8080'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                }
            }
        }
        
        stage('Stop Old Container') {
            steps {
                sh '''
                    docker stop ${IMAGE_NAME} || true
                    docker rm ${IMAGE_NAME} || true
                '''
            }
        }
        
        stage('Run Container') {
            steps {
                sh '''
                    docker run -d \
                        --name ${IMAGE_NAME} \
                        --restart unless-stopped \
                        -p ${CONTAINER_PORT}:80 \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }
        
        stage('Cleanup Old Images') {
            steps {
                sh '''
                    docker images ${IMAGE_NAME} --format "{{.Tag}}" | \
                    grep -v ${IMAGE_TAG} | \
                    xargs -I {} docker rmi ${IMAGE_NAME}:{} || true
                '''
            }
        }
    }
    
    post {
        success {
            echo "部署成功！访问 http://YOUR_SERVER:${CONTAINER_PORT}"
        }
        failure {
            echo '部署失败，请检查日志'
        }
    }
}
