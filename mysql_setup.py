#!/usr/bin/env python3
"""
MySQL Database Setup for PhotoSphere - Professional Event Photography Portal
This script creates a MySQL database and configures it for use with the application.
"""

import os
import pymysql
from datetime import datetime

def create_mysql_connection():
    """Create a MySQL connection for database setup."""
    # Use environment variables or defaults for MySQL connection
    config = {
        'host': os.environ.get('MYSQL_HOST', 'localhost'),
        'user': os.environ.get('MYSQL_USER', 'root'),
        'password': os.environ.get('MYSQL_PASSWORD', ''),
        'port': int(os.environ.get('MYSQL_PORT', 3306)),
        'charset': 'utf8mb4',
        'collation': 'utf8mb4_unicode_ci'
    }
    
    return pymysql.connect(**config)

def create_database():
    """Create the PhotoSphere database."""
    connection = create_mysql_connection()
    
    try:
        with connection.cursor() as cursor:
            # Create database
            cursor.execute("CREATE DATABASE IF NOT EXISTS photosphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print("✓ Database 'photosphere' created successfully")
            
            # Create user for the application (optional)
            cursor.execute("CREATE USER IF NOT EXISTS 'photosphere_user'@'%' IDENTIFIED BY 'photosphere_password'")
            cursor.execute("GRANT ALL PRIVILEGES ON photosphere.* TO 'photosphere_user'@'%'")
            cursor.execute("FLUSH PRIVILEGES")
            print("✓ Database user created and privileges granted")
            
        connection.commit()
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False
    finally:
        connection.close()
    
    return True

def get_database_url():
    """Generate the database URL for the application."""
    host = os.environ.get('MYSQL_HOST', 'localhost')
    port = os.environ.get('MYSQL_PORT', 3306)
    user = os.environ.get('MYSQL_USER', 'photosphere_user')
    password = os.environ.get('MYSQL_PASSWORD', 'photosphere_password')
    database = 'photosphere'
    
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4"

def test_connection():
    """Test the database connection."""
    try:
        connection = pymysql.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            user=os.environ.get('MYSQL_USER', 'photosphere_user'),
            password=os.environ.get('MYSQL_PASSWORD', 'photosphere_password'),
            database='photosphere',
            port=int(os.environ.get('MYSQL_PORT', 3306)),
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"✓ MySQL Connection successful! Version: {version[0]}")
            
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def main():
    """Main setup function."""
    print("🚀 Setting up MySQL database for PhotoSphere...")
    print("=" * 50)
    
    # Create database
    if create_database():
        print("\n📊 Database setup completed successfully!")
        
        # Generate database URL
        db_url = get_database_url()
        print(f"\n🔗 Database URL: {db_url}")
        
        # Test connection
        print("\n🔍 Testing database connection...")
        if test_connection():
            print("\n✅ MySQL setup completed successfully!")
            print("\nTo use MySQL with your application, set the environment variable:")
            print(f"export MYSQL_DATABASE_URL='{db_url}'")
            
            # Create a .env file for development
            with open('.env', 'w') as f:
                f.write(f"MYSQL_DATABASE_URL={db_url}\n")
                f.write("SESSION_SECRET=your-secret-key-here\n")
            
            print("\n📝 Environment variables saved to .env file")
            print("🎉 PhotoSphere is ready to use with MySQL!")
            
        else:
            print("\n❌ Database connection test failed")
            return False
    else:
        print("\n❌ Database setup failed")
        return False
    
    return True

if __name__ == "__main__":
    main()