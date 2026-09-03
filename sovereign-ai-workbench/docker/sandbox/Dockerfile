FROM python:3.12-slim

# Install data science and calculation libraries for sandbox execution
RUN pip install --no-cache-dir \
    numpy>=1.26.0 \
    pandas>=2.2.0 \
    openpyxl>=3.1.5 \
    scipy>=1.14.0 \
    matplotlib>=3.9.0

# Create non-root unprivileged execution user
RUN useradd -m -u 1000 sandboxuser
USER sandboxuser
WORKDIR /workspace

CMD ["python"]
