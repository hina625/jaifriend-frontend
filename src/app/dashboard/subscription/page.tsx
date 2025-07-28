"use client";
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscriptions</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8f9fa;
            color: #333;
            min-height: 100vh;
            padding: 24px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            margin-bottom: 48px;
        }

        .header h1 {
            font-size: 28px;
            font-weight: 600;
            color: #1a1a1a;
        }

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            min-height: 400px;
            padding: 48px 24px;
        }

        .icon {
            width: 64px;
            height: 64px;
            margin-bottom: 24px;
            opacity: 0.6;
        }

        .icon svg {
            width: 100%;
            height: 100%;
            fill: #6b7280;
        }

        .message {
            font-size: 16px;
            color: #6b7280;
            font-weight: 400;
        }

        @media (max-width: 768px) {
            body {
                padding: 16px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .empty-state {
                min-height: 300px;
                padding: 32px 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Subscriptions</h1>
        </div>
        
        <div class="empty-state">
            <div class="icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <p class="message">You didn't subscribe to any users yet.</p>
        </div>
    </div>
</body>
</html>