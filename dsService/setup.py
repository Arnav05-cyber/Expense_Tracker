from setuptools import setup, find_packages

install_requires = [
    'flask==3.1.2',
    'kafka-python==2.3.0',
    'python-dotenv==1.2.1',
    'langchain-core==1.2.7',
    'langchain-mistralai==1.1.1',
    'langchain-openai==1.1.7',
    'pydantic==2.12.5'
]

setup (
    name='dsService',
    version='0.1.0',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    install_requires=install_requires,
    include_package_data=True
)