#!/bin/bash
cd /var/sites/census_env
source bin/activate
cd census-explorer 
gunicorn main:app -b 127.0.0.1:8080 
