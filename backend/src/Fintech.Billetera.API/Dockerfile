# syntax=docker/dockerfile:1.7
ARG DOTNET_VERSION=10.0

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION} AS build
WORKDIR /src

COPY Directory.Build.props Directory.Packages.props ./
COPY src/Fintech.Billetera.Domain/Fintech.Billetera.Domain.csproj           src/Fintech.Billetera.Domain/
COPY src/Fintech.Billetera.Application/Fintech.Billetera.Application.csproj src/Fintech.Billetera.Application/
COPY src/Fintech.Billetera.Infrastructure/Fintech.Billetera.Infrastructure.csproj src/Fintech.Billetera.Infrastructure/
COPY src/Fintech.Billetera.API/Fintech.Billetera.API.csproj                 src/Fintech.Billetera.API/
RUN dotnet restore src/Fintech.Billetera.API/Fintech.Billetera.API.csproj

COPY src/ src/
RUN dotnet publish src/Fintech.Billetera.API/Fintech.Billetera.API.csproj \
    -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION} AS runtime
WORKDIR /app

RUN groupadd --system --gid 1000 app && useradd --system --uid 1000 --gid app --no-create-home app
USER app

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_NOLOGO=1 \
    AUTO_MIGRATE=true

EXPOSE 8080

COPY --from=build --chown=app:app /app/publish ./
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD ["dotnet", "--info"]

ENTRYPOINT ["dotnet", "Fintech.Billetera.API.dll"]
